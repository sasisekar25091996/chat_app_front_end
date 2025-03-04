const CurrentUser = ({ currentUser }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/userprofile.jpg`}
        alt="Logo"
        style={{
          width: "50%",
          height: "auto",
          borderRadius: "50%",
        }}
      />
      <h2>{currentUser}</h2>
    </div>
  );
};

export default CurrentUser;
