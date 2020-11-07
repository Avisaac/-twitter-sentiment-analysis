import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns'

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      filter: {
        type: null,
        value: null,
      },
      startDate: null,
      endDate: null,
    }
  }

  componentDidMount() {
    this.initApi()
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch((err) => console.log(err));

    setInterval(() => {
      this.fetchApi()
        .then((res) => {
          this.setState({ data: res.data });
        })
        .catch((err) => console.log(err));
    }, 2500);
  }

  initApi = async () => {
    const response = await fetch("/api/init");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  fetchApi = async () => {
    // console.log(this.state.filter.value)
    // console.log(this.state.filter.type)
    if(this.state.filter.type === 'date') {
      this.dateFilterSetState()
    }

    let path = this.state.filter.value ? `/api/fetch/${this.state.filter.type}/${this.state.filter.value}`: "/api/fetch"
    const response = await fetch(path);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  dateFilterSetState = () => {
    const timeFormat = "yyyy-MM-dd HH:mm:ss"
    if(this.state.startDate && this.state.endDate) {
      const dateRange = `${format(this.state.startDate, timeFormat)}__${format(this.state.endDate, timeFormat)}`
      this.setState({
        filter: {
          type: "date-range",
          value: dateRange,
        }
      })
    } else if(this.state.startDate) {
      this.setState({
        filter: {
          type: "date-from",
          value: format(this.state.startDate, timeFormat)
        }
      })
    } else if(this.state.endDate) {
      this.setState({
        filter: {
          type: "date-to",
          value: format(this.state.endDate, timeFormat)
        }
      })
    }
  }

  filter = () => {
    // console.log(this.state.filter.type, this.state.filter.value)
    this.fetchApi(this.state.filter.type, this.state.filter.value)
  };

  setCity(e) {
    this.setState({
      filter: {
        type: "fullName",
        value: e.target.value,
      } 
    });
  }

  setCountry(e) {
    console.log(e.target.value)
    this.setState({
      filter: {
        type: "country",
        value: e.target.value,
      }
    });
  }

  setStartDate(date) {
    console.log(date);
    this.setState({
      startDate: date,
      filter: {
        type: "date",
        value: null,
      },
    });
  }

  setEndDate(date) {
    console.log(date);
    this.setState({
      endDate: date,
      filter: {
        type: "date",
        value: null,
      },
    });
  }

  orderData = (orderBy) => {

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p><b>Twitter Sentiment Analysis</b></p>
        </header>
 
        <div className="filters">
          <span>Add filter by country, city or date range.</span>
          <div className="inputs">
            <input
              type="text"
              placeholder="country"
              onChange={(e) => this.setCountry(e)}
            ></input>
            <input
              type="text"
              placeholder="city"
              onChange={(e) => this.setCity(e)}
            ></input>
          </div>
          <div className="datepickers">
            <DatePicker
              selected={this.state.startDate}
              onChange={(date) => this.setStartDate(date)}
              selectsStart
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Start date"
            />
            <DatePicker
              selected={this.state.endDate}
              onChange={(date) => this.setEndDate(date)}
              selectsEnd
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="End date"
            />
          </div>
          {/* <button className="filter-button" onClick={() => this.filter()}>
            Filter
          </button> */}
          <div className="filtering">
            {this.state.filter.value ? `Filtering by ${this.state.filter.type}: ${this.state.filter.value.replace('__', ' - ')}` : null}
          </div>
        </div>

        <div className="data">
          <div className="row">
            <div className="country-data">
              <div className="country"><b>Country</b></div>
              <div className="city-data">
                <div className="city-container">
                  <div className="city"><b>City</b></div>
                  <div className="stats"><div className="positive"><b>Positive</b></div><div className="negative"><b>Negative</b></div></div>
                </div>
              </div>
            </div>
          </div>
          {this.state.data && Object.keys(this.state.data).map((country) => (
              <div key={country.key} className="row">
                <div className="country-data">
                  <div className="country">{country}</div>
                  <div className="city-data">
                    {this.state.data[country].map((d) => (
                      <div key={d.city} className="city-container">
                        <div className="city">{d.city}</div>
                        <div className="stats">
                          <div className="positive">{((d.positive / (d.negative + d.positive)) * 100).toFixed(1)}% <span className="stats-num">({d.positive})</span></div>
                          <div className="negative">{((d.negative / (d.negative + d.positive)) * 100).toFixed(1)}% <span className="stats-num">({d.negative})</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default App;
