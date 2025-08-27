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
            Send USDC to any address on the Fuji network
          </p>
        </div>
      </div>
    </>
  );
};
