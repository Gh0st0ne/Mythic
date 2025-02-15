import React, {useEffect} from 'react';
import {TaskDisplay} from '../Callbacks/TaskDisplay';
import {useSubscription, gql, useLazyQuery } from '@apollo/client';
import LinearProgress from '@material-ui/core/LinearProgress';
import  {useParams} from "react-router-dom";
import {useReactiveVar} from '@apollo/client';
import { meState } from '../../../cache';
import {TaskMetadataTable} from './MetadataTable';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { useContext} from 'react';
import {ThemeContext} from 'styled-components';

const subTaskQuery = gql`
subscription subTaskQuery($task_id: Int!) {
  task_by_pk(id: $task_id) {
        comment
        commentOperator{
            username
        }
        completed
        id
        operator{
            username
        }
        display_params
        original_params
        status
        timestamp
        command {
          cmd
          id
        }
        responses{
            id
        }
        opsec_pre_blocked
        opsec_pre_bypassed
        opsec_post_blocked
        opsec_post_bypassed
        tasks {
            id
        }
    }
}`;
export function SingleTaskView(props){
   const {taskId} = useParams();
   const [taskIDs, setTaskIDs] = React.useState([]);
   const [commandId, setCommandId] = React.useState(0);
   const theme = useContext(ThemeContext);

   const {loading, error, data} = useSubscription(subTaskQuery, {
     variables: {task_id: parseInt(taskId)},
     onSubscriptionData: completedData => {
        console.log(completedData.subscriptionData.data.task_by_pk.tasks);
        const tasks = completedData.subscriptionData.data.task_by_pk.tasks.reduce( (prev, cur) => {
            if(taskIDs.includes(cur.id)){
                return [...prev];
            }else{
                return [...prev, cur.id];
            }
        }, [...taskIDs]);
        setTaskIDs(tasks);
        setCommandId(completedData.subscriptionData.data.task_by_pk.command.id);
     }
    });
    useEffect( () => {
        setTaskIDs([parseInt(taskId)]);
    }, []);
    if (loading) {
     return <LinearProgress style={{marginTop: "10px"}}/>;
    }
    if (error) {
     console.error(error);
     return <div>Error!</div>;
    }
  return (
    <div style={{marginTop: "10px", maxHeight: "calc(92vh)"}}>
        <Paper elevation={5} style={{backgroundColor: theme.pageHeader, marginBottom: "5px", marginTop: "10px"}} variant={"elevation"}>
            <Typography variant="h4" style={{textAlign: "left", display: "inline-block", marginLeft: "20px", color: theme.pageHeaderColor}}>
                Task View
            </Typography>
        </Paper>
        <TaskDisplay task={data.task_by_pk} command_id={commandId} />
        <TaskMetadataTable taskIDs={taskIDs} />
    </div>
  );
}
//
