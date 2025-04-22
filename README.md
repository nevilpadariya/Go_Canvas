# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Deployment to Render

This project is configured for deployment on Render using Docker. Follow these steps to deploy:

1. Push your code to a GitHub repository
2. Log in to [Render](https://render.com/)
3. Click on "New+" and select "Blueprint" from the dropdown
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` configuration
6. Update the repository URL in `render.yaml` to point to your GitHub repository
7. Click "Apply" to start the deployment process

The application will be built using the Dockerfile and served via Nginx on Render's infrastructure. Once deployed, you can access your application using the URL provided by Render.

### Manual Deployment (Alternative)

Alternatively, you can manually deploy without using the Blueprint:

1. Click on "New+" and select "Web Service"
2. Connect your GitHub repository
3. Select "Docker" as the runtime
4. Configure the service with your desired name, branch, and other settings
5. Click "Create Web Service"

Render will automatically build and deploy your application.
