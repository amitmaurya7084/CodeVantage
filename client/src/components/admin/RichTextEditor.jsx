import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Keep this in sync with server/utils/sanitizeContent.js's allowedTags —
// offering formatting the server will strip anyway just confuses the admin.
const modules = {
  toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["blockquote", "link"], ["clean"]],
};

const formats = ["bold", "italic", "underline", "list", "bullet", "blockquote", "link"];

function RichTextEditor({ value, onChange, placeholder }) {
  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}

export default RichTextEditor;
