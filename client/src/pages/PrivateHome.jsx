function PrivateHome() {
  const username = localStorage.getItem("username");

  return (
    <div className="page">
      <div className="box">
        <h2>Welcome "{username}"</h2>
      </div>
    </div>
  );
}

export default PrivateHome;
