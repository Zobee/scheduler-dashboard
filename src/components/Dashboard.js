import React, { Component } from "react";
import axios from "axios";
import classnames from "classnames";

import Loading from "./Loading";
import Panel from "./Panel";

const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: 6
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: "1pm"
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: "Wednesday"
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: "2.3"
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
      axios.get("/api/interviewers")
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });
    
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
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
      value={data.value}
      selectPanel={(e) => this.selectPanel(data.id)}/>)}
    </main>
  }
}

export default Dashboard;
