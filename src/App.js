import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/main.css";
import NoteItem from "./components/NoteItem/";
import FormNote from "./components/FormNote/";
import PouchDB from "pouchdb";
import PouchDBAuth from "pouchdb-authentication";
import PouchDBFind from "pouchdb-find";
import uuid from "uuid/v1";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

PouchDB.plugin(PouchDBAuth);
PouchDB.plugin(PouchDBFind);

class App extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      alert: {
        display: false,
        type: "success",
        msg: "Lorem ipsum dolor sit amet"
      },
      edit: null
    };

    this.db = new PouchDB("simplenote");
    this.remoteDb = new PouchDB("http://localhost:5984/simplenote", {
      skip_setup: true
    });
  }

  componentDidMount() {
    this.loadNote();
    this.remoteDb
      .logIn("dbreader", "12345", {
        ajax: {
          headers: {
            Authorization: "Basic " + window.btoa("dbreader:12345")
          }
        }
      })
      .then(function() {
        console.log("login berhasil");
      })
      .catch(function(error) {
        console.error(error);
      });
  }

  showAlert = (type, msg) => {
    const alert = {
      display: true,
      type,
      msg
    };
    this.setState({ alert });

    setTimeout(() => {
      alert.display = false;
      this.setState({
        alert
      });
    }, 3000);
  };

  loadNote = () => {
    this.db
      .allDocs({
        include_docs: true
      })
      .then(res => {
        const data = res.rows.map(val => {
          return val.doc;
        });
        this.setState({ data });
      })
      .catch(err => {
        console.log(err);
      });
    const now = new Date();
    this.db
      .find({
        selector: { created_at: { $gt: now } },
        sort: [{ created_at: "desc" }]
      })
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  };

  addNote = note => {
    const data = [...this.state.data];
    const newData = {
      _id: uuid(),
      note,
      created_at: new Date()
    };
    data.push(newData);
    this.db
      .put(newData)
      .then(res => {
        this.setState({ data });
      })
      .catch(err => {
        console.log(err);
      });
  };

  deleteNote = index => {
    const listdata = [...this.state.data];
    const data = listdata[index];
    this.db
      .remove(data)
      .then(res => {
        listdata.splice(index, 1);
        this.setState({ data: listdata });
      })
      .catch(err => {
        console.log(err);
      });
  };

  editNote = index => {
    const listdata = [...this.state.data];
    const data = listdata[index];
    this.setState({ edit: data });
  };

  updateNote = (data, note) => {
    const listdata = [...this.state.data];
    const index = listdata.findIndex(val => val._id === data._id);
    const self = this;
    console.log(data);
    this.db
      .get(data._id)
      .then(doc => {
        doc.note = note;
        return self.db.put(doc);
      })
      .then(() => {
        listdata[index].note = note;
        self.setState({ listdata });
        this.showAlert("success", "Berhasil update");
      })
      .catch(err => {
        console.log(err);
        self.setState({ edit: null });
        this.showAlert("danger", "Gagal update");
      });
  };

  onSync = () => {
    this.db.replicate
      .to(this.remoteDb)
      .on("complete", () => {
        this.showAlert("success", "Syncronization to Server, complete!");
      })
      .on("error", err => {
        console.log("Error => ", err);
        this.showAlert("danger", "Syncronization to Server, failed!");
      });
  };

  onCopy = () => {
    this.db.replicate
      .from(this.remoteDb)
      .on("complete", () => {
        this.showAlert("success", "Copy from Server, complete!");
        this.loadNote();
      })
      .on("error", err => {
        console.log("Error => ", err);
        this.showAlert("danger", "Copy from Server, failed!");
      });
  };

  onDestroy = () => {
    this.db
      .destroy()
      .then(res => {
        this.showAlert("success", "Reset data, success!");
        this.setState({ data: [] });
        this.db = new PouchDB("simplenote");
      })
      .catch(err => {
        console.log(err);
        this.showAlert("danger", "Reset data, failed!");
      });
  };

  render() {
    const alert = this.state.alert;
    return (
      <div className="container">
        <div className="col-md-8 offset-md-2">
          <h1 className="text-center m-5">Simple Note</h1>
          <FormNote
            edit={this.state.edit}
            onSubmit={this.addNote}
            onUpdate={this.updateNote}
            onCancel={() => this.setState({ edit: null })}
          />
          <div className="mb-3 text-right">
            <Dropdown>
              <Dropdown.Toggle variant="light" size="sm" id="action">
                <Icon icon={faEllipsisH} size="sm" />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={this.onSync}>
                  Sync to Server
                </Dropdown.Item>
                <Dropdown.Item onClick={this.onCopy}>
                  Copy from Server
                </Dropdown.Item>
                <Dropdown.Item onClick={this.onDestroy}>
                  Reset Data
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div
            className={cx("alert alert-" + alert.type, {
              "d-none": !alert.display
            })}
          >
            {alert.msg}
          </div>
          <div className="list-group">
            {this.state.data.map((val, idx) => {
              return (
                <NoteItem
                  index={idx}
                  onDelete={this.deleteNote}
                  onEdit={this.editNote}
                  key={val._id}
                  data={val}
                />
              );
            })}
          </div>
          <div className="footer">
            <p className="text-center text-black-50">Sabrowi &copy; 2019</p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
