import React, { useState } from 'react';
import axios from 'axios';
import '../style/home.scss';

export const Home = () => {
    const [imageSrc, setImageSrc] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [proccessingImage, setProccessingImage] = useState(false);
    const [showCountButton, setShowCountButton] = useState(false);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result);
                setShowCountButton(true);
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
        setProccessingImage(true);

        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`http://localhost:5000/check-processed/${fileName}`);
                if (response.status === 200) {
                    setImageSrc(`http://localhost:5000/${response.data.filePath}`);
                    clearInterval(interval); // Stop polling once the image is found
                    setProccessingImage(false);
                    setShowCountButton(false);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log('Processed image not found, continuing to poll...');
                } else {
                    console.error('Error checking for processed image:', error);
                    clearInterval(interval);
                    setProccessingImage(false);
                    setShowCountButton(false);
                }
            }
        }, 2000); // Poll every 2 seconds
    };

    return (
        <div className="home">
            <nav className="navbar">
                <div className="heading">
                    <img className="logo" src="/images/compieLogo.svg" alt="Compie Logo" />
                    <img className="logo" src="/images/namal-ashdod-logo.png" alt="Namal Ashdod Logo" />
                </div>
                <div className="action-buttons">
                    {showCountButton && <button onClick={uploadImage} className="primary-button">ספירה</button>}
                    <>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="fileInput"
                        />
                        <button onClick={() => {
                            document.getElementById('fileInput').click();
                        }} className="primary-button">
                            העלאת תמונה
                        </button>
                    </>
                </div>


            </nav>
            <div className="image-layout">
                {(imageSrc && !proccessingImage) && <img src={imageSrc} alt="Loaded" />}
                {proccessingImage && (
                    <div className="loading-message">
                        <img className="loading-spinner" src="/images/loading.gif" alt="Loading Spinner" />
                            מעלה תמונה
                    </div>
                )}
                {(!imageSrc && !proccessingImage) && <div>
                    <div className="loading-message">
                        <img className="upload-icon" src="/images/upload-icon.svg" alt="Upload Icon" />
                        לחץ על כפתור ״העלאת תמונה״ לבחירת תמונה
                    </div>

                </div>}
            </div>
        </div>
    );
};
