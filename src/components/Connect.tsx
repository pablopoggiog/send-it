/**
 * Component for displaying the app header with title and subtitle.
 */
export const Connect = () => {
  return (
    <>
      {/* App Header */}
      <div className="app-header">
        <div className="header-content">
          <h1 className="title">Send Tokens</h1>
          <p className="subtitle">
            Send tokens to any address or contact on a given network
          </p>
        </div>
      </div>
    </>
  );
};
