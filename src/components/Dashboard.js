import React, { Component } from "react";
import axios from "axios";
import classnames from "classnames";

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay,
 } from "helpers/selectors";

 import {setInterview} from "helpers/reducers"

import Loading from "./Loading";
import Panel from "./Panel";

const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
];

class Dashboard extends Component {
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {}
  }
  componentDidMount(){
    const focused = JSON.parse(localStorage.getItem("focused"));
    if(focused) this.setState({focused})

    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers"),
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL)
    //On receipt of data from the wss, update state to reference the new data
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

  selectPanel = (id) => {
    this.setState(prev => prev.focused ? {focused: null} : {focused: id})
   }
   
  render() {
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
     });
    
    return this.state.loading ? <Loading /> 
    : 
    <main className={dashboardClasses}>
      {data
      .filter(panel => this.state.focused === null || this.state.focused === panel.id)
      .map(data => <Panel 
      key={data.id} 
      id={data.id} 
      label={data.label} 
      value={data.getValue(this.state)}
      selectPanel={(e) => this.selectPanel(data.id)}/>)}
    </main>
  }
}

export default Dashboard;
