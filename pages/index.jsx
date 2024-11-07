import React, { useEffect, useState, useRef } from 'react';
import { Camera } from 'react-camera-pro';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

export default function Home() {
    const camera = useRef(null);
    const [numberOfCameras, setNumberOfCameras] = useState(0);
    const [ratio, setRatio] = useState(1);
    const [model, setModel] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [data, setData] = useState({});
    const [result, setResult] = useState("");
    const URL = "https://teachablemachine.withgoogle.com/models/bvkUkni6a";
    let webcam;

    async function init() {
        const modelURL = URL + '/model.json';
        const metadataURL = URL + '/metadata.json';
        const model = await tmImage.load(modelURL, metadataURL);
        const maxPredictions = model.getTotalClasses();
        console.log("maxPredictions", maxPredictions);
        webcam = new tmImage.Webcam(500, 500, false);
        await webcam.setup();
        webcam.play();

        window.requestAnimationFrame(loop);

        async function loop() {
            webcam.update(); // update the webcam frame
            await predict();
            window.requestAnimationFrame(loop);
        }
        async function predict() {
            // predict can take in an image, video or canvas html element
            const prediction = await model.predict(webcam.canvas);

            for (let i = 0; i < maxPredictions; i++) {
                setData(prediction);
                const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                if (prediction[0].probability.toFixed(2) > 0.5) {
                    setResult("車いす");
                } else if (prediction[1].probability.toFixed(2) > 0.5) {
                    setResult("なし");
                } else if (prediction[2].probability.toFixed(2) > 0.5) {
                    setResult("赤ちゃんマーク");
                }
                setPredictions([...predictions, classPrediction]);
            }
        }

        setRatio(1);
        setModel(model);
    }
    useEffect(() => { init() }, [numberOfCameras]);
    const ramusage = tf.memory().numBytes / 1024 / 1024 + "MB";
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
        }}>
            <h1>標識認識</h1>
            <div style={{
                backgroundColor: 'lightgray',
                width: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                height: '80vh',
                borderRadius: '10px'
            }}>
                {model ?
                    <div>
                        <Camera
                            ref={webcam}
                            numberOfCamerasCallback={setNumberOfCameras}
                            facingMode={"user"}
                            aspectRatio={ratio}
                        />
                        <p>model: {URL}</p>
                        <p>predictions:</p>
                        <div style={{
                            height: '200px',
                            fontSize: '8vh',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {result}
                        </div>
                    </div>
                    :
                    <p>読み込み中</p>
                }
            </div>
        </div>
    )
}