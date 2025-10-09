import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";

import Jobs from "./pages/Jobs";
import Attribute from "./pages/configure/Attribute";
import DQRules from "./pages/configure/DQRules";
import Database from "./pages/configure/Database";
import TagConfiguration from "./pages/onetime/TagConfiguration";
import DBConnection from "./pages/onetime/DBConnection";
import DQConfiguration from "./pages/onetime/DQConfiguration";
import PreviewJob from "./pages/onetime/PreviewJob";
import RecurringTagcofiguration from "./pages/recurring/RecurringTagcofiguration";
import RecurringDBConnection from "./pages/recurring/RecurringDBConnection";
import RecurringDQConfiguration from "./pages/recurring/RecurringDQConfiguration";

import OnetimeJob from "./pages/jobs/OnetimeJob";
import RecurringJob from "./pages/jobs/RecurringJob";

import Onetimepreviewjob from "./pages/jobs/Onetimepreviewjob";
import Schedulepreviewjob from "./pages/jobs/Schedulepreviewjob";
import Schedulejob from "./pages/jobs/Schedulejob";
import RecurringPreviewJobs from "./pages/recurring/RecurringPreviewJobs";
import Recurringpreviewjob from "./pages/jobs/Recurringpreviewjob";
import Histroy from "./pages/jobs/Histroy";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/layout" element={<Layout />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/configure/attribute" element={<Attribute />} />
          <Route path="/configure/database" element={<Database />} />
          <Route path="/configure/dqrule" element={<DQRules />} />

          {/* One-Time */}
          <Route path="/tagconfiguration" element={<TagConfiguration />} />
          <Route path="/dbconnection" element={<DBConnection />} />
          <Route path="/dqconfiguration" element={<DQConfiguration />} />
          <Route path="/previewjob" element={<PreviewJob />} />

          {/* Recurring */}
          <Route
            path="/recurring-tagconfiguration"
            element={<RecurringTagcofiguration />}
          />
          <Route
            path="/recurring-dbconnection"
            element={<RecurringDBConnection />}
          />
          <Route
            path="/recurring-dqconfiguration"
            element={<RecurringDQConfiguration />}
          />
          <Route
            path="/recurring-previewjobs"
            element={<RecurringPreviewJobs />}
          />

          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/onetimejob" element={<OnetimeJob />} />
          <Route path="/jobs/schedulejob" element={<Schedulejob />} />
          <Route path="/jobs/recurringjob" element={<RecurringJob />} />
          <Route
            path="/jobs/onetimepreviewjob"
            element={<Onetimepreviewjob />}
          />
          <Route
            path="/jobs/schedulepreviewjob"
            element={<Schedulepreviewjob />}
          />
          <Route
            path="/jobs/recurringpreviewjob"
            element={<Recurringpreviewjob />}
          />
          <Route path="/jobs/history" element={<Histroy />} />
          <Route path="/profile" element={<Profile/>}/>
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
