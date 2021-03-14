import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

export const UiFileInputButton = (props) => {
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles?.length) {
      return;
    }

    const formData = new FormData();

    Array.from(acceptedFiles).forEach((file) => {
      formData.append(props.name, file);
    });

    setLoading(true);
    await props.onChange(formData);
    setLoading(false);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ accept: props.accept, onDrop, multiple: props.multiple });
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  return (
    <form {...getRootProps({ style })}>
      <Button
        variant="contained"
        color="primary"
        type="button"
        disabled={loading}
      >
        {props.label}
      </Button>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here ...</p>
      ) : (
        <p>Drag &apos;n&apos; drop some files here, or click to select file</p>
      )}
      <LinearProgress style={{ width: loading ? "100%" : 0 }} />
    </form>
  );
};

UiFileInputButton.defaultProps = {
  accept: "",
  multiple: false,
};
