'use client';
import { useMemo } from 'react';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

export const Editor = ({ onChange, value }) => {
    const ReactQuill = useMemo(() => dynamic(() => import('react-quill-new'), { ssr: false }), []);
    return (
        <div className="bg-white">
            <ReactQuill theme="snow" value={value} onChange={onChange} />
        </div>
    );
};
