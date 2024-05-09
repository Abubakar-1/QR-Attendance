import React, { useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

const Scanner = ({ onScan }) => {
  const videoRef = useRef();
  const codeReader = useRef(null);
  const codeReaderTaskRef = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    codeReader.current
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        const selectedDeviceId = videoInputDevices[0]?.deviceId;
        const constraints = {
          video: {
            deviceId: selectedDeviceId
              ? { exact: selectedDeviceId }
              : undefined,
          },
        };
        codeReaderTaskRef.current = codeReader.current.decodeFromConstraints(
          constraints,
          videoRef.current,
          (result) => {
            if (result) onScan(result.text);
          }
        );
      })
      .catch((err) => {
        console.error("Error while listing video input devices: ", err);
      });

    return () => {
      if (
        codeReaderTaskRef.current &&
        typeof codeReaderTaskRef.current.cancel === "function"
      ) {
        codeReaderTaskRef.current.cancel();
      }
      if (
        codeReader.current &&
        typeof codeReader.current.reset === "function"
      ) {
        codeReader.current.reset();
      }
    };
  }, [onScan]);

  return <video ref={videoRef} autoPlay playsInline />;
};

export default Scanner;
