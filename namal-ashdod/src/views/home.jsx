import React, { useState } from 'react';
import axios from 'axios';
import logo from '../images/compieLogo.svg';
import '../style/home.scss';

export const Home = () => {
    const [imageSrc, setImageSrc] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false); // State to track loading

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!selectedImageFile) return;

        const formData = new FormData();
        formData.append('image', selectedImageFile);

        try {
            await axios.post('http://localhost:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Image uploaded successfully');

            pollForProcessedImage();
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const pollForProcessedImage = () => {
        setLoading(true); // Start loading when polling begins

        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`http://localhost:5000/check-processed/${fileName}`);
                if (response.status === 200) {
                    setImageSrc(`http://localhost:5000/${response.data.filePath}`);
                    clearInterval(interval); // Stop polling once the image is found
                    setLoading(false); // Stop loading
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log('Processed image not found, continuing to poll...');
                } else {
                    console.error('Error checking for processed image:', error);
                    clearInterval(interval);
                    setLoading(false); // Stop loading if there's an error
                }
            }
        }, 2000); // Poll every 2 seconds
    };

    return (
        <div className="home">
            <img className="compie-logo" src={logo} alt="Logo" />
            <div className="title">נמל אשדוד</div>
            <div className="action-buttons">
                {selectedImageFile && <button onClick={uploadImage} className="primary-button">ספירה</button>}
                <>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="fileInput"
                    />
                    <button onClick={() => document.getElementById('fileInput').click()} className="primary-button">
                        העלאת תמונה
                    </button>
                </>
            </div>

            {/* Loading Spinner */}
            {loading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>...מעבד תמונה</p>
                </div>
            )}

            {imageSrc && !loading && (
                <div className="image-layout">
                    <img src={imageSrc} alt="Loaded" />
                </div>
            )}
        </div>
    );
};
