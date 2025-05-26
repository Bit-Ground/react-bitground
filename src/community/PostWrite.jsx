import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
import './post.css';
import api from "../api/axiosConfig.js";

const PostWrite = () => {
    const navigate = useNavigate();
    const quillRef = useRef(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('잡담');
    const [userId, setUserId] = useState(1);

    // 임시 사용자 정보 (나중엔 로그인 유저 정보로 대체)
    useEffect(() => {
        setUserId(1); // 예: 로그인한 사용자 ID
    }, []);

    // 이미지 업로드 핸들러
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const res = await api.post('/api/posts/upload-image', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                    });

                    const imageUrl = res.data.url;

                    if (quillRef.current) {
                        const editor = quillRef.current.getEditor();
                        let range = editor.getSelection();
                        if (!range) {
                            const length = editor.getLength();
                            editor.setSelection(length, 0);
                            range = editor.getSelection();
                        }
                        editor.insertEmbed(range.index, 'image', imageUrl);
                    }
                } catch (err) {
                    console.error('이미지 업로드 실패', err);
                }
            }
        };
    }, []);

    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [imageHandler]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        formData.append('userId', userId);

        try {

            await api.post('/api/posts/form', formData, {
                headers: {}
            });
            alert('글이 등록되었습니다!');
            navigate('/community');
        } catch (err) {
            console.error(err);
            alert('등록 실패');
        }
    };

    return (
        <div>
            <div className='postheader'>
                <button type='button' className='listbtn' onClick={() => navigate('/community')}> &lt; 목록 </button>
            </div>
            <div className='write-container'>
                <div className='writer-info'>
                    <div className='writer-profile'>
                        <img src='/default-profile.jpg' alt="프로필" className='profile-image' />
                        <div className='writer-details'>
                            <span className='writer-tier'>[Silver]</span>
                            <span className='writer-nickname'>개발왕</span>
                        </div>
                    </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className='category-select'
                    >
                        <option value="잡담">잡담</option>
                        <option value="정보">정보</option>
                        <option value="질문">질문</option>
                    </select>
                </div>
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
                    {/*<div className='write-body'>*/}
                    {/*    <ReactQuill*/}
                    {/*        ref={quillRef}*/}
                    {/*        value={content}*/}
                    {/*        onChange={setContent}*/}
                    {/*        modules={quillModules}*/}
                    {/*        theme="snow"*/}
                    {/*    />*/}
                    {/*</div>*/}
                    <div className='write-footer'>
                        <button type='submit' className='submit-button'>등록하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostWrite;