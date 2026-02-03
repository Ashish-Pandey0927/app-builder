import "../style/hero.css";
import FakeEditorPreview from "./FakeEditorPreview";
export default function Hero({ onStart }) {
    return(
        <section className="hero">
            <div className="hero-left">
                <h1>
                    Build real mobile apps <span>visually</span>
                </h1>

                <p className="hero-sub">
                    Describe an app. Edit it visually. Export it instantly.
                    <br />
                    No code. No hassle.
                </p>

                <div className="hero-cta">
                    <button className="primary" onClick={onStart}>Try the Editor</button> 
                    <button className="secondary">Demo Video</button> 
                </div>
                <p className="hero-cta-note">No sign-up required. Free beta</p>
            </div>

            <div className="hero-right">
                <FakeEditorPreview />
            </div>
        </section>
    )
}