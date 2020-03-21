import React from "react";
import styles from "./NoteItem.module.css";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

const NoteItem = ({ data, onDelete, onEdit, index }) => {
  return (
    <div className={styles.noteitem}>
      <p>{data.note}</p>
      <div className="row">
        <div className="col-md-6">
          <Dropdown>
            <Dropdown.Toggle variant="light" size="sm" id="action">
              <Icon icon={faEllipsisH} size="sm" />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => onEdit(index)}>Edit</Dropdown.Item>
              <Dropdown.Item onClick={() => onDelete(index)}>
                Hapus
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="col-md-6">
          <div
            className="text-right"
            style={{ fontSize: "12px", color: "#999" }}
          >
            {moment(data.created_at).fromNow()}
          </div>
        </div>
      </div>
    </div>
  );
};

NoteItem.defaultProps = {
  onDelete: id => console.log(id)
};

export default NoteItem;
