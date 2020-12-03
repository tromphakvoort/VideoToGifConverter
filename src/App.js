import React, { useState, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  const convertToGif = async () => {
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
  };

  useEffect(() => {
    load();
  }, []);

  return ready ? (
    <>
      <h1>Video to gif converter</h1>
      <div className="App">
        {video && (
          <video controls width="250" src={URL.createObjectURL(video)} />
        )}

        <input
          type="file"
          onChange={(e) => setVideo(e.target.files?.item(0))}
        />

        <h2>Result</h2>

        <button onClick={convertToGif}>Convert</button>

        {gif && <img src={gif} width="250" alt="Output Gif" />}
      </div>
    </>
  ) : (
    <p>loading...</p>
  );
}

export default App;
