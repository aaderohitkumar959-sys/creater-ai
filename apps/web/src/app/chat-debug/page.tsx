
export default function Debug() {
    return (
        <div style={{ padding: 50, background: 'white', color: 'black' }}>
            <h1>CHAT DEBUG PAGE — NO AUTH — {Date.now()}</h1>
            <p>If you see this, the App Router is working and Hosting is NOT blocking generic routes.</p>
        </div>
    );
}
