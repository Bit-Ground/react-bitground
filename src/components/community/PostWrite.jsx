import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../styles/community/post.css';
import api from "../../api/axiosConfig.js";
import { useAuth } from '../../auth/useAuth.js';

/**
 * 게시글 작성 페이지 컴포넌트
 * - 제목, 카테고리 선택, 내용 작성 기능 제공
 * - ReactQuill 에디터를 사용한 리치 텍스트 편집 지원
 * - 이미지 업로드 기능 포함
 * - 작성자 정보 자동 포함
 */
const PostWrite = () => {
    const navigate = useNavigate();
    const quillRef = useRef(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('CHAT');
    const user = useAuth();
    
    /**
     * 사용자 인증 정보 확인
     * - 로그인한 사용자의 정보를 콘솔에 출력
     * - 개발/디버깅 목적으로 사용
     */
    useEffect(() => {
        console.log("✅ 로그인한 사용자 ID:", user.user.id);
        console.log("✅ 전체 user 객체:", user);
    }, [user]);

    /**
     * 이미지 업로드 핸들러
     * - 에디터에서 이미지 업로드 시 호출
     * - 서버에 이미지를 업로드하고 URL을 받아 에디터에 삽입
     * - 이미지 업로드 실패 시 에러 처리
     */
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

                    setTimeout(() => {
                        const editorElem = quillRef.current.editor?.root;

                            const imgs = editorElem?.querySelectorAll(`img[src="${imageUrl}"]`);
                            imgs?.forEach(img => {
                                img.style.width = '300px';
                                img.style.height = 'auto';
                                img.setAttribute('width', '300px');
                                img.setAttribute('height', 'auto');
                            });
                        }, 0);

                    }
                    console.log(quillRef.current.getEditor().root.innerHTML);
                } catch (err) {
                    console.error('이미지 업로드 실패', err);
                }
            }
        };
    }, []);

    /**
     * Quill 에디터 설정
     * - 툴바 옵션 설정
     * - 이미지 핸들러 연결
     */
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
            },
        }
    }), [imageHandler]);

    /**
     * 게시글 등록 처리
     * - 제목과 내용이 비어있는지 검증
     * - 서버에 게시글 데이터 전송
     * - 성공 시 커뮤니티 메인 페이지로 이동
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        const formData = {
            user: { id : user.user.id },
            title: title,
            content: content,
            category: category
        }

        try {
            await api.post('/api/posts/form', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            alert('글이 등록되었습니다!');
            navigate('/community');
        } catch {
            alert('등록 실패');
        }
    };

    return (
        <div>
            {/* 상단 네비게이션 */}
            <div className='postheader'>
                <button type='button' className='listbtn' onClick={() => navigate('/community')}> &lt; 목록 </button>
            </div>
            <div className='write-container'>
                {/* 작성자 정보 및 카테고리 선택 */}
                <div className='writer-info'>
                    <div className='writer-profile'>
                        <img src={user.user.profileImage} alt="프로필" className='profile-image' />
                        <div className='writer-details'>
                            <span className='writer-tier'>[Silver]</span>
                            <span className='writer-nickname'>{user.user.name}</span>
                        </div>
                    </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className='category-select'
                    >
                        <option value="CHAT">CHAT</option>
                        <option value="INFO">INFO</option>
                        <option value="QUESTION">QUESTION</option>
                    </select>
                </div>

                {/* 게시글 작성 폼 */}
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
                        <ReactQuill
                            ref={quillRef}
                            value={content}
                            onChange={setContent}
                            modules={quillModules}
                            theme="snow"
                            className={'ReactQuill'}
                        />
                    </div>
                    <br/><br/><br/>
                    <div className='write-footer'>
                        <button type='submit' className='submit-button'>등록하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostWrite;