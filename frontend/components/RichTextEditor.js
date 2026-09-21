import dynamic from 'next/dynamic';

// Dynamically imported with ssr:false — Quill uses browser-only APIs (document, window)
// that crash on the server. The loading fallback prevents layout shift.
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div style={loadingStyle}>Loading editor…</div>
  ),
});

// Toolbar: headings, bold/italic/underline, blockquote, link, lists, clear
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    ['blockquote', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline',
  'blockquote', 'link',
  'list', 'bullet',
];

// value: HTML string (from article.content)
// onChange: receives HTML string on every keystroke
export default function RichTextEditor({ value, onChange }) {
  return (
    <div style={wrapperStyle}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
      />
    </div>
  );
}

const loadingStyle = {
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  padding: '0.75rem',
  color: '#9ca3af',
  fontSize: '0.9rem',
  minHeight: '180px',
};

const wrapperStyle = {
  // Quill renders two divs (.ql-toolbar + .ql-container) — wrapper gives
  // consistent border-radius treatment matching the rest of the form inputs
  borderRadius: '4px',
  overflow: 'hidden',
};
