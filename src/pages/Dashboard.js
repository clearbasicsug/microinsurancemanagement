import { useState, useEffect } from "react";
import useAuth from "../contexts/Auth";
import "../styles/dashboard.css";
import Header from "../components/header/Header";
import { authentication, functions } from "../helpers/firebase";
import { httpsCallable } from "firebase/functions";
import { getUsers } from "../helpers/helpfulUtilities";
import FirstContainer from "../components/FirstContainer";
import UsersContainer from "../components/UsersContainer";
import GraphContainer from "../components/GraphContainer";
import {
  getAllStickers,
  getAllSuperAdminStickers,
  getAllClaims,
  getAllSuperAdminClaims,
} from "../helpers/helpfulUtilities";

import Chat from "../components/messenger/Chat";
import "../styles/ctas.css";
import { useToggleMenu } from "hooks";

function Dashboard({ largeContentClass }) {
  const { authClaims } = useAuth();
  const [users, setUsers] = useState([]);
  const [policies, setPolicies] = useState([]);

  const [claims, setClaims] = useState([]);
  const [claimsSettled, setClaimsSettled] = useState([]);

  useEffect(() => {
    document.title = "Dashboard - SWICO";

    const listUsers = httpsCallable(functions, "listUsers");

    if (authClaims.agent) {
      getUsers("Customer").then((result) => setUsers(result));
      getAllStickers([authentication.currentUser.uid]).then((result) =>
        setPolicies(result)
      );

      getAllClaims([authentication.currentUser.uid]).then((result) => {
        const settledClaims = result.filter(
          (claim) => claim.status === "settled"
        );
        setClaims(result);
        setClaimsSettled(settledClaims);
      });
    } else if (authClaims.supervisor) {
      getUsers("agent").then((result) => setUsers(result));

      listUsers().then(async ({ data }) => {
        const myAgents = data
          .filter((user) => user.role.agent === true)
          .filter(
            (agent) =>
              agent.meta.added_by_uid === authentication.currentUser.uid
          )
          .map((agentuid) => agentuid.uid);
        getAllStickers([...myAgents, authentication.currentUser.uid]).then(
          (result) => setPolicies(result)
        );

        getAllClaims([...myAgents, authentication.currentUser.uid]).then(
          (result) => {
            const settledClaims = result.filter(
              (claim) => claim.status === "settled"
            );
            setClaims(result);
            setClaimsSettled(settledClaims);
          }
        );
      });
    } else if (authClaims.admin) {
      getUsers("supervisor").then((result) => setUsers(result));
      listUsers().then(({ data }) => {
        const myAgents = data
          .filter((user) => user.role.agent)
          .filter(
            (agent) =>
              agent.meta.added_by_uid === authentication.currentUser.uid
          )
          .map((agentuid) => agentuid.uid);

        const mySupervisors = data
          .filter((user) => user.role.supervisor)
          .filter(
            (supervisor) =>
              supervisor.meta.added_by_uid === authentication.currentUser.uid
          )
          .map((supervisoruid) => supervisoruid.uid);

        const agentsUnderMySupervisors = data
          .filter((user) => user.role.agent === true)
          .filter((agent) => mySupervisors.includes(agent.meta.added_by_uid))
          .map((agentuid) => agentuid.uid);

        getAllStickers([
          ...myAgents,
          ...mySupervisors,
          ...agentsUnderMySupervisors,
          authentication.currentUser.uid,
        ]).then((result) => setPolicies(result));

        getAllClaims([
          ...myAgents,
          ...mySupervisors,
          ...agentsUnderMySupervisors,
          authentication.currentUser.uid,
        ]).then((result) => {
          const settledClaims = result.filter(
            (claim) => claim.status === "settled"
          );
          setClaims(result);
          setClaimsSettled(settledClaims);
        });
      });
    } else if (authClaims.superadmin) {
      getUsers("admin").then((result) => setUsers(result));
      getAllSuperAdminStickers().then((result) => setPolicies(result));

      getAllSuperAdminClaims().then((result) => {
        const settledClaims = result.filter(
          (claim) => claim.status === "settled"
        );
        setClaims(result);
        setClaimsSettled(settledClaims);
      });
    }
  }, []);

  return (
    <div className="components">
      <Header
        title="Welcome to Statewide Insurance."
        subtitle="WITH YOU EVERY STEP OF THE WAY"
      />

      <div className="componentsData">
        <div
          id="first-row"
          className={`mb-5 my-2 first-row ${
            !largeContentClass
              ? "tw-overflow-y-hidden tw-overflow-x-hidden"
              : ""
          } ${
            users?.length > 0 ? "" : ""
          } tw-py-1 tw-px-1 tw-flex tw-flex-col lg:tw-flex-row tw-justify-between`}
        >
          <FirstContainer
            claimsSettled={claimsSettled}
            policies={policies}
            claims={claims}
          />
          <UsersContainer authClaims={authClaims} users={users} />
        </div>

        <GraphContainer policies={policies} />
      </div>
      {/* <div
        style={{
          width: "100%",
          position: "fixed",
          bottom: "0px",
          display: "flex",
          justifyContent: "flex-end",
        }}
        className={true ? "chat-container" : "expanded-menu-chat-container"}
      >
        <Chat />
      </div> */}
    </div>
  );
}

export default Dashboard;