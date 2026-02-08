import React from 'react'
import "../style/HowItWorks.css";

const HowItWorks = () => {
  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <h4>From idea to app in minutes</h4>

      <div className="steps">
        <div className="step">
            <span className='step-number'>01</span>
            <h3>Enter your idea</h3>
            <p>Describe your app in simple terms. The more details, the better!</p>
            <img src="/promptpage.jfif" alt="" />
        </div>

        <div className="step">
            <span className='step-number'>02</span>
            <h3>AI generates your app</h3>
            <p>Our AI instantly creates a fully visual app design based on your description.</p>
        </div>

        <div className="step">
            <span className='step-number'>03</span>
            <h3>Edit visually</h3>
            <p>Use our intuitive editor to customize your app's look and feel with drag-and-drop.</p>
            <img src="/editor.jfif" alt="" />
        </div>

        <div className="step">
            <span className='step-number'>04</span>
            <h3>Export & launch</h3>
            <p>Export your app's code and assets, ready to be published on app stores.</p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks