import "./App.css";
import Button from "./components/Button";
import TitleBar from "./components/TitleBar";

function App() {
  return (
    <div className="desktop-frame">
      <TitleBar title="Lysbilde" />
      <div className="app-layout">
        <aside aria-label="Presentation filters" className="sidebar">
          <nav className="sidebar-nav">
            <a aria-current="page" className="sidebar-item sidebar-item--active">
              <span className="sidebar-icon">⊞</span>
              <span>All</span>
              <span className="sidebar-count">0</span>
            </a>
            <a className="sidebar-item">
              <span className="sidebar-icon">★</span>
              <span>Starred</span>
            </a>
            <a className="sidebar-item">
              <span className="sidebar-icon">↺</span>
              <span>Recent</span>
            </a>
            <a className="sidebar-item">
              <span className="sidebar-icon">⌫</span>
              <span>Trash</span>
            </a>
          </nav>
        </aside>
        <main className="workspace">
          <header className="workspace-header">
            <div>
              <h1>Lysbilde</h1>
              <p>Organize and present HTML-based slide decks.</p>
            </div>
            <Button variant="primary">New presentation</Button>
          </header>
          <section aria-labelledby="presentations-heading" className="empty-state">
            <div>
              <p className="section-eyebrow">Library</p>
              <h2 id="presentations-heading">Presentations</h2>
              <p>
                Import local HTML slides, arrange them into a deck, and present
                without changing the original files.
              </p>
            </div>
            <div aria-hidden="true" className="empty-thumbnail">
              <span />
              <span />
              <span />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
