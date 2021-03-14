import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import { saveAs } from "file-saver";
import PropTypes from "prop-types";
import React from "react";
import { UiFileInputButton } from "../components/UiFileInputButton";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function IndexPage() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onChange = async (formData) => {
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    const response = await axios.post("/api/twitter", formData, config);

    const blob = new Blob([response.data.data], {
      type: "text/csv;charset=utf-8",
    });
    saveAs(blob, "data.csv");
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="Twitter" {...a11yProps(0)} />
          <Tab label="Instagram" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <UiFileInputButton
          label="Upload CSV File"
          name="list"
          onChange={onChange}
          accept=".csv"
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography>Coming soon</Typography>
      </TabPanel>
    </div>
  );
}
