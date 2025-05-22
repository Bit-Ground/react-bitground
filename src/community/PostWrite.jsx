import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './post.css';

const PostWrite = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            await axios.post('/api/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            alert('게시글이 작성되었습니다.');
            navigate('/community');
        } catch (error) {
            console.error('게시글 작성 실패:', error);
            alert('게시글 작성에 실패했습니다.');
        }
    };

    return (
        <div>
            <div className='postheader'>
                <button type='button' className='listbtn' onClick={() => navigate('/community')}> &lt; 목록 </button>
            </div>
            <div className='write-container'>
                <form onSubmit={handleSubmit}>
                    <div className='write-header'>
                        <input
                            type="text"
                            className='write-title'
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className='write-body'>
                        <textarea
                            className='write-content'
                            placeholder="내용을 입력하세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className='image-upload'>
                            <input
                                type="file"
                                id="image-input"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="image-input" className='upload-button'>
                                📷 이미지 업로드
                            </label>
                            {previewUrl && (
                                <div className='image-preview'>
                                    <img src={previewUrl} alt="미리보기" />
                                    <button 
                                        type="button" 
                                        className='remove-image'
                                        onClick={() => {
                                            setImage(null);
                                            setPreviewUrl('');
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='write-footer'>
                        <button type='submit' className='submit-button'>
                            등록하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostWrite;