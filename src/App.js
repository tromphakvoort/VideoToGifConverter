import React, { useState, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { message, Spin } from "antd";
import "./app.css";
import { Container, Row, Col, Button } from "react-bootstrap";

const ffmpeg = createFFmpeg({ log: false });

function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();
  const [loading, setLoading] = useState(false);
  const [fileUpload, setFileUpload] = useState("Choose file");

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  const convertToGif = async () => {
    setLoading(true);
    // Write the video file to memory
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(video));

    // Run the ffmpeg command
    await ffmpeg.run(
      "-i",
      "video.mp4",
      "-t",
      "2.5",
      "-ss",
      "2.0",
      "-f",
      "gif",
      "output.gif"
    );

    // Read the result
    const data = ffmpeg.FS("readFile", "output.gif");

    // Create object URL
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );

    // Add the object URL to state
    setGif(url);
    setLoading(false);
    message.success("Converted succesfully!");
  };

  useEffect(() => {
    load();
  }, []);

  return ready ? (
    <>
      <div md={12} className="heading">
        <h1>Video to gif converter</h1>
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col md={12} className="fileUpload">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroupFileAddon01">
                  Upload video
                </span>
              </div>
              <div className="custom-file">
                <input
                  type="file"
                  className="custom-file-input"
                  id="inputGroupFile01"
                  aria-describedby="inputGroupFileAddon01"
                  onChange={(e) => {
                    setVideo(e.target.files?.item(0));
                    setFileUpload(
                      e.target.files?.item(0)
                        ? e.target.files?.item(0).name
                        : "Choose file"
                    );
                  }}
                />
                <label className="custom-file-label" htmlFor="inputGroupFile01">
                  {fileUpload}
                </label>
              </div>
            </div>
          </Col>
          {video && (
            <>
              <Col md={6}>
                <video controls width="75%" src={URL.createObjectURL(video)} />
              </Col>
              <Col md={6}>
                <Spin
                  tip="Converting video"
                  size="large"
                  spinning={loading}
                  delay={500}
                >
                  {gif && <img src={gif} width="75%" alt="Output Gif" />}
                </Spin>
              </Col>
              <Col md={6} className="convertToGif">
                <Button variant="warning" block onClick={convertToGif}>
                  Convert to gif
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Container>
      <footer>
        <strong>Tromp Hakvoort ©2020</strong>
      </footer>
    </>
  ) : (
    <div className="loading">
      <Spin tip="Loading page..." size="large"></Spin>
    </div>
  );
}

export default App;
