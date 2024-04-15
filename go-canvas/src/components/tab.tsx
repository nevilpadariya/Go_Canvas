import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div className='custom-tabs'
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export default function CustomTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%',border:'transparent' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="tab-box">
                <Tabs value={value} onChange={handleChange} indicatorColor="primary">
                    <Tab label="Tab 1" />
                    <Tab label="Tab 2" />
                    <Tab label="Tab 3" />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <p>1.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam rutrum interdum quisque sed sit. Urna cursus eu libero accumsan odio arcu tempor. Eget amet volutpat consequat suscipit in a netus in magna. Risus mattis sed morbi phasellus est nunc. Sagittis, quam aenean ut vel tristique rhoncus. Id risus vivamus dictum ultricies justo, magna venenatis, elit. Ipsum eu rhoncus egestas eu, orci. In nisl nulla tristique dolor. Vulputate lobortis massa vel massa tempor. Pulvinar urna, metus, in ac aliquet quam. Ligula sit tellus nulla diam ac placerat condimentum suspendisse. Lectus eget id ac viverra in eu dolor vulputate malesuada. Amet gravida placerat congue convallis est.</p>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <p>2.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam rutrum interdum quisque sed sit. Urna cursus eu libero accumsan odio arcu tempor. Eget amet volutpat consequat suscipit in a netus in magna. Risus mattis sed morbi phasellus est nunc. Sagittis, quam aenean ut vel tristique rhoncus. Id risus vivamus dictum ultricies justo, magna venenatis, elit. Ipsum eu rhoncus egestas eu, orci. In nisl nulla tristique dolor. Vulputate lobortis massa vel massa tempor. Pulvinar urna, metus, in ac aliquet quam. Ligula sit tellus nulla diam ac placerat condimentum suspendisse. Lectus eget id ac viverra in eu dolor vulputate malesuada. Amet gravida placerat congue convallis est.</p>
            </TabPanel>
        </Box>
    );
}
