import { Md1xMobiledata } from "react-icons/md";

export default function FakeEditorPreview() {
  return (
    <div className="editor-frame">
      <div className="fake-cursor"></div>
      <div className="editor-toolbar">
        <div className="dot red"></div>
        <div className="dot yellow"></div>
        <div className="dot green"></div>
      </div>

      <div className="editor-body">
        <div className="editor-sidebar">
          <div className="sidebar-item active">Button</div>
          <div className="sidebar-item">Text</div>
          <div className="sidebar-item">Image</div>
        </div>

        <div className="editor-canvas">
          <div className="phone-mockup">
            <img
              src="/phone_14_01.png"
              alt="Phone Preview"
              className="phone-frame"
            />
            <div className="phone-screen">
              <div className="status-bar">10:10</div>
              <div className="screen">
                <div className="fake-button">Get Started</div>
              </div>
            </div>
              <img
                src="/cursor-alt-svgrepo-com.svg"
                alt="Fake Cursor"
                className="fake-cursor"
              />
          </div>
        </div>
      </div>
    </div>
  );
}
