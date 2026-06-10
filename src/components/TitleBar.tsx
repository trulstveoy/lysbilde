type TitleBarProps = {
  title: string;
};

function TitleBar({ title }: TitleBarProps) {
  return (
    <header className="titlebar">
      <div aria-hidden="true" className="traffic-lights">
        <span className="traffic-light traffic-light--close" />
        <span className="traffic-light traffic-light--minimize" />
        <span className="traffic-light traffic-light--zoom" />
      </div>
      <div className="titlebar-title">{title}</div>
      <div aria-hidden="true" className="titlebar-spacer" />
    </header>
  );
}

export default TitleBar;
