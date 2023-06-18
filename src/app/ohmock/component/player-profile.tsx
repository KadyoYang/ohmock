import { PlayerDescription } from "../player/om.player.interface";

export const BigPlayerProfile: React.FC<{
  description?: PlayerDescription;
  customClickEvent: () => void;
}> = ({ description, customClickEvent }) => {
  return (
    <div
      style={{ width: "300px", height: "300px", border: "3px solid yellow" }}
      onClick={customClickEvent}
    >
      {description ? (
        <>
          {" "}
          <div>{description.nickname}</div>
          <div>{description.tactics}</div>
        </>
      ) : (
        <>
          {" "}
          <div>blank</div>
          <div>blank</div>
        </>
      )}
    </div>
  );
};

export const SmallPlayerProfile: React.FC<{
  description: PlayerDescription;
  customClickEvent: () => void;
}> = ({ description, customClickEvent }) => {
  return (
    <div
      style={{
        width: "100px",
        height: "50px",
        margin: "3px 3px",
        background: "black",
      }}
      onClick={customClickEvent}
    >
      {/* <Image
        src="https://picsum.photos/200/300"
        width={100}
        height={20}
        alt={""}
      /> */}
      <h3 style={{ textAlign: "center" }}>{description.nickname}</h3>
    </div>
  );
};
