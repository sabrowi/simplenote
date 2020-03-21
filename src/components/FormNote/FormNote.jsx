import React, { useState, Fragment, useEffect } from "react";
import styles from "./FormNote.module.css";

const FormNote = ({ onSubmit, edit, onUpdate, onCancel }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (edit !== null) {
      setText(edit.note);
    }
  }, [edit]);

  return (
    <div className={styles.formnote}>
      <textarea
        onChange={e => setText(e.target.value)}
        cols="30"
        rows="3"
        className="form-control mb-3"
        placeholder="Apa yang anda pikirkan?"
        value={text}
      />
      {edit === null ? (
        <button
          className="btn btn-primary"
          onClick={() => {
            onSubmit(text);
            setText("");
          }}
        >
          Simpan
        </button>
      ) : (
        <Fragment>
          <button
            className="btn btn-primary"
            onClick={() => {
              onUpdate(edit, text);
              setText("");
            }}
          >
            Update
          </button>{" "}
          <button
            className="btn btn-danger"
            onClick={() => {
              onCancel();
              setText("");
            }}
          >
            Batal
          </button>
        </Fragment>
      )}
    </div>
  );
};

FormNote.defaultProps = {
  onSubmit: text => console.log(text)
};

export default FormNote;
