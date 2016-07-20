import { Route, Redirect, IndexRoute, IndexRedirect } from 'react-router';
import React from 'react';
import Dashboard from './Dashboard';
import MyChart from './MyChart';
import OrganizationPipelines from './OrganizationPipelines';
import {
    Pipelines,
    MultiBranch,
    Activity,
    PullRequests,
    PipelinePage,
    RunDetails,
    RunDetailsPipeline,
    RunDetailsChanges,
    RunDetailsArtifacts,
    RunDetailsTests,
} from './components';

export default (
    <Route path="/" component={Dashboard}>
        <Route path="chart" component={MyChart}/>
    </Route>
);
