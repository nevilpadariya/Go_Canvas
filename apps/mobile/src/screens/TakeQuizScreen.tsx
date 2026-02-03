import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { getApi, postApi } from '@gocanvas/shared';

interface QuizOption {
  Optionid: number;
  Optiontext: string;
  Iscorrect?: boolean;
  Optionorder: number;
}

interface QuizQuestion {
  Questionid: number;
  Questiontext: string;
  Questiontype: string; // 'multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_in_blank'
  Questionpoints: number;
  Questionorder: number;
  options?: QuizOption[];
}

interface Quiz {
  quizid: number;
  quizname: string;
  quizdescription: string;
  Timelimitminutes: number | null;
  Allowedattempts: number | null;
  questions: QuizQuestion[];
}

interface Answer {
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
}

export default function TakeQuizScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { quizId, quizName, courseId } = route.params as { quizId: number; quizName: string; courseId: number };

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchQuiz = async () => {
    try {
      const data = await getApi<Quiz>(`/quiz/${quizId}`);
      setQuiz(data);

      // Initialize answers array
      const initialAnswers: Answer[] = data.questions.map((q) => ({
        questionId: q.Questionid,
      }));
      setAnswers(initialAnswers);

      // Set timer if quiz has time limit
      if (data.Timelimitminutes) {
        setTimeRemaining(data.Timelimitminutes * 60);
      }
    } catch (error: any) {
      console.error('Failed to fetch quiz', error);
      Alert.alert('Error', 'Failed to load quiz');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateAnswer = (questionId: number, selectedOptionId?: number, answerText?: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId
          ? { ...a, selectedOptionId, answerText }
          : a
      )
    );
  };

  const handleSubmit = async () => {
    // Check for unanswered questions
    const unanswered = answers.filter(
      (a) => !a.selectedOptionId && !a.answerText
    );

    if (unanswered.length > 0 && timeRemaining !== 0) {
      Alert.alert(
        'Incomplete Quiz',
        `You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit Anyway', onPress: submitQuiz },
        ]
      );
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const payload = {
        quizid: quizId,
        answers: answers.map((a) => ({
          questionid: a.questionId,
          selectedoptionid: a.selectedOptionId,
          answertext: a.answerText,
        })),
      };

      await postApi(`/quiz/${quizId}/submit`, payload);

      Alert.alert('Success', 'Quiz submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Failed to submit quiz', error);
      Alert.alert('Error', error.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: QuizQuestion) => {
    const answer = answers.find((a) => a.questionId === question.Questionid);

    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1} of {quiz?.questions.length}
          </Text>
          <Text style={styles.questionPoints}>{question.Questionpoints} pts</Text>
        </View>

        <Text style={styles.questionText}>{question.Questiontext}</Text>

        {(question.Questiontype === 'multiple_choice' ||
          question.Questiontype === 'true_false') && (
          <View style={styles.optionsContainer}>
            {question.options?.map((option) => (
              <TouchableOpacity
                key={option.Optionid}
                style={[
                  styles.optionButton,
                  answer?.selectedOptionId === option.Optionid && styles.optionSelected,
                ]}
                onPress={() => updateAnswer(question.Questionid, option.Optionid)}
              >
                {answer?.selectedOptionId === option.Optionid ? (
                  <CheckCircle size={20} color={Colors.primary} />
                ) : (
                  <Circle size={20} color={Colors.mutedForeground} />
                )}
                <Text
                  style={[
                    styles.optionText,
                    answer?.selectedOptionId === option.Optionid &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option.Optiontext}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {(question.Questiontype === 'short_answer' ||
          question.Questiontype === 'fill_in_blank') && (
          <TextInput
            style={styles.shortAnswerInput}
            placeholder="Enter your answer..."
            value={answer?.answerText || ''}
            onChangeText={(text) => updateAnswer(question.Questionid, undefined, text)}
            multiline={false}
          />
        )}

        {question.Questiontype === 'essay' && (
          <TextInput
            style={styles.essayInput}
            placeholder="Write your essay response..."
            value={answer?.answerText || ''}
            onChangeText={(text) => updateAnswer(question.Questionid, undefined, text)}
            multiline
            textAlignVertical="top"
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={Colors.destructive} />
          <Text style={styles.errorText}>Failed to load quiz</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.quizTitle} numberOfLines={1}>
            {quizName}
          </Text>
        </View>
        {timeRemaining !== null && (
          <View style={[styles.timer, timeRemaining < 60 && styles.timerWarning]}>
            <Clock size={16} color={timeRemaining < 60 ? Colors.destructive : Colors.foreground} />
            <Text
              style={[styles.timerText, timeRemaining < 60 && styles.timerTextWarning]}
            >
              {formatTime(timeRemaining)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` },
          ]}
        />
      </View>

      {/* Question */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderQuestion(currentQuestion)}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={() => setCurrentQuestionIndex((prev) => prev + 1)}
          >
            <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.submitButton]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.navButtonText, styles.submitButtonText]}>Submit Quiz</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.mutedForeground,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.destructive,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backIcon: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.foreground,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  timerWarning: {
    backgroundColor: '#fef2f2',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.foreground,
  },
  timerTextWarning: {
    color: Colors.destructive,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.secondary,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  questionContainer: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  questionPoints: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.foreground,
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f0fdf4',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.foreground,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  shortAnswerInput: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  essayInput: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 200,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.foreground,
  },
  navButtonTextPrimary: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: Colors.indigo600,
  },
  submitButtonText: {
    color: '#fff',
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
