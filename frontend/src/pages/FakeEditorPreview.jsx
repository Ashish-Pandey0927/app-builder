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
                    <div className="phone">
                        <div className="status-bar">10:10 <Md1xMobiledata /></div>
                        <div className="screen">
                            <h3 className="fake-text">Welcome</h3>
                            <button className="fake-btn">Get Started</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}