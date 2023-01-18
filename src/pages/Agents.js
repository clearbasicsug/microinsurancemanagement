import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Pagination from "../helpers/Pagination";
import SearchBar from "../components/searchBar/SearchBar";
import Header from "../components/header/Header";
import { functions, authentication, db } from "../helpers/firebase";
import { httpsCallable } from "firebase/functions";
import { Table, Modal, Form, Button } from "react-bootstrap";
import useAuth from "../contexts/Auth";
import { MdEdit, MdDelete } from "react-icons/md";
import Loader from "../components/Loader";
import ClientModal from "../components/ClientModal";
import useDialog from "../hooks/useDialog";
import { ImFilesEmpty } from "react-icons/im";
import { MdStickyNote2 } from "react-icons/md";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import StickerModal from "../components/StickersModal";
import { FaUserPlus } from "react-icons/fa";
import { IoMdAlert } from "react-icons/io";
import { handleAllCheck } from "../helpers/helpfulUtilities";
import { getUsers } from "../helpers/helpfulUtilities";

import { toast } from "react-toastify";

import "../styles/ctas.css";

function Agents() {
  const [agents, setAgents] = useState([]);
  const [shouldUpdate, setShouldUpdate] = useState(false);

  useEffect(() => {
    // your code here
    setShouldUpdate(true);
  }, []);

  useEffect(() => {
    document.title = "Agents - SWICO";
    getAgents();
    setShouldUpdate(false);
    return () => {};
  }, [shouldUpdate]);

  const { authClaims } = useAuth();

  // initialising the logs collection.
  const logCollectionRef = collection(db, "logs");

  const getAgents = () => {
    const listUsers = httpsCallable(functions, "listUsers");
    if (authClaims.supervisor) {
      listUsers()
        .then(({ data }) => {
          const myAgents = data
            .filter((user) => user.role.agent === true)
            .filter(
              (agent) =>
                agent.meta.added_by_uid === authentication.currentUser.uid ||
                (agent.meta?.supervisor &&
                  agent.meta?.supervisor === authentication.currentUser.uid)
            );
          myAgents.length === 0 ? setAgents(null) : setAgents(myAgents);
        })
        .catch((err) => console.log(err));
    } else if (authClaims.admin) {
      listUsers()
        .then(({ data }) => {
          const mySupervisors = data
            .filter((user) => user.role.supervisor === true)
            .filter(
              (supervisor) =>
                supervisor.meta.added_by_uid === authentication.currentUser.uid
            )
            .map((supervisoruid) => supervisoruid.uid);

          const agentsUnderAdmin = [
            ...mySupervisors,
            authentication.currentUser.uid,
          ];

          const myAgents = data
            .filter((user) => user.role.agent === true)
            .filter((agent) =>
              agentsUnderAdmin.includes(agent.meta.added_by_uid)
            );

          myAgents.length === 0 ? setAgents(null) : setAgents(myAgents);
        })
        .catch((err) => console.log(err));
    }
  };

  const [open, handleOpen, handleClose] = useDialog();

  const [openSticker, handleOpenSticker, handleCloseSticker] = useDialog();
  const [openPromo, handleOpenPromo, handleClosePromo] = useDialog();

  // search for agent
  const [searchText, setSearchText] = useState("");
  const handleSearch = ({ target: { value } }) => setSearchText(value);
  const searchByName = (data) =>
    data.filter(
      (row) => row.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
    );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(10);
  const indexOfLastAgent = currentPage * clientsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - clientsPerPage;
  const currentAgents =
    !agents || searchByName(agents).slice(indexOfFirstAgent, indexOfLastAgent);
  const totalPagesNum = !agents || Math.ceil(agents.length / clientsPerPage);

  // upgrade a single agent's authClaims
  /* const handleUpdate = async () => {
    const updateUser = httpsCallable(functions, 'updateUser')

    updateUser({uid: singleDoc.uid})
      .then()
      .then(async () => {
        await addDoc(logCollectionRef, {
          timeCreated: `${new Date().toISOString().slice(0, 10)} ${ new Date().getHours()}:${ new Date().getMinutes()}:${ new Date().getSeconds()}`,
          type: 'user update',
          status: 'successful',
          message: `Successfully updated agent - ${singleDoc.name.toUpperCase()} by ${authentication.currentUser.displayName}`
        })
      })
      .catch( async () => {
        toast.error(`Failed to update ${singleDoc.name}`, {position: "top-center"});
        await addDoc(logCollectionRef, {
          timeCreated: `${new Date().toISOString().slice(0, 10)} ${ new Date().getHours()}:${ new Date().getMinutes()}:${ new Date().getSeconds()}`,
          type: ' user update',
          status: 'failed',
          message: `Failed to update agent - ${singleDoc.name.toUpperCase()} by ${authentication.currentUser.displayName}`
        })
    })
  }; */

  // delete a single agent
  const handleDelete = async () => {
    const deleteUser = httpsCallable(functions, "deleteUser");
    deleteUser({ uid: singleDoc.uid })
      .then(() =>
        toast.success(`Successfully deleted ${singleDoc.name}`, {
          position: "top-center",
        })
      )
      .then(() => setShouldUpdate(true))
      .then(async () => {
        await addDoc(logCollectionRef, {
          timeCreated: `${new Date()
            .toISOString()
            .slice(
              0,
              10
            )} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
          type: "user deletion",
          status: "successful",
          message: `Successfully deleted agent - ${singleDoc.name.toUpperCase()} by ${
            authentication.currentUser.displayName
          }`,
        });
      })
      .catch(async () => {
        toast.error(`Failed to deleted ${singleDoc.name}`, {
          position: "top-center",
        });
        await addDoc(logCollectionRef, {
          timeCreated: `${new Date()
            .toISOString()
            .slice(
              0,
              10
            )} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
          type: "user deletion",
          status: "failed",
          message: `Failed to delete agent - ${singleDoc.name.toUpperCase()} by ${
            authentication.currentUser.displayName
          }`,
        });
      });
  };

  const handleMultpleDelete = async (arr) => {
    const deleteUser = httpsCallable(functions, "deleteUser");
    deleteUser({ uid: arr[0] })
      .then(() =>
        toast.success(`Successfully deleted ${arr[1]}`, {
          position: "top-center",
        })
      )
      .then(async () => {
        await addDoc(logCollectionRef, {
          timeCreated: `${new Date()
            .toISOString()
            .slice(
              0,
              10
            )} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
          type: "user deletion",
          status: "successful",
          message: `Successfully deleted agent - ${arr[1].toUpperCase()} by ${
            authentication.currentUser.displayName
          }`,
        });
      })
      .catch(async () => {
        toast.error(`Failed to deleted ${arr[1]}`, { position: "top-center" });
        await addDoc(logCollectionRef, {
          timeCreated: `${new Date()
            .toISOString()
            .slice(
              0,
              10
            )} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
          type: "user deletion",
          status: "failed",
          message: `Failed to delete agent - ${arr[1].toUpperCase()} by ${
            authentication.currentUser.displayName
          }`,
        });
      });
  };

  // delete multiple agents
  const [bulkDelete, setBulkDelete] = useState(null);
  const [deleteArray, setDeleteArray] = useState([]);
  const handleBulkDelete = async () => {
    if (bulkDelete) {
      deleteArray.map((agent) => handleMultpleDelete(agent));
    }
  };

  // Confirm Box
  const [showContext, setShowContext] = useState(false);
  const [openToggle, setOpenToggle] = useState(false);
  window.onclick = (event) => {
    if (openToggle === true) {
      if (!event.target.matches(".wack") && !event.target.matches("#myb")) {
        setOpenToggle(false);
      }
    }
    if (!event.target.matches(".sharebtn")) {
      setShowContext(false);
    }
  };

  // get a single doc
  const [singleDoc, setSingleDoc] = useState({});
  const [clickedIndex, setClickedIndex] = useState(null);

  // filter
  const [switchCategory, setSwitchCategory] = useState(null);
  const shownAgents =
    !agents ||
    currentAgents.filter(
      (agent) => !switchCategory || agent.role[switchCategory]
    );
  const paginatedShownAgent =
    !agents || shownAgents.slice(indexOfFirstAgent, indexOfLastAgent);

  const handleAgentPromotionSubmit = (event) => {
    event.preventDefault();
    const updateUser = httpsCallable(functions, "updateUser");
    updateUser({
      uid: singleDoc.uid,
      name: singleDoc.name,
      supervisor: true,
      agent: false,
    })
      .then(() => {
        toast.success(`Promoted ${singleDoc.name} to a supervisor`, {
          position: "top-center",
        });
      })
      .catch(() => {
        toast.success(`Promoted ${singleDoc.name} to a supervisor`, {
          position: "top-center",
        });
      });
    handleClosePromo();
  };

  return (
    <>
      <div className="components">
        <Header title="Agents" subtitle="MANAGING AGENTS" />

        <div id="add_client_group">
          <div></div>
          {authClaims.supervisor && (
            <Link to="/supervisor/add-agents" className="classic">
              <button className="btn cta m-2">Add Agent</button>
            </Link>
          )}
          {authClaims.admin && (
            <Link to="/admin/add-agent" className="classic">
              <button className="btn cta m-2">Add Agent</button>
            </Link>
          )}
        </div>

        <div className={openToggle ? "myModal is-active" : "myModal"}>
          <div className="modal__content wack">
            <h5 className="wack">Delete {singleDoc.name}?</h5>
            <p className="wack">
              Are you sure you want to delete {singleDoc.name}, You cannot undo
              this action.
            </p>
            <div className="buttonContainer wack">
              <button
                id="noButton"
                onClick={() => setOpenToggle(false)}
                className="wack"
              >
                No, Cancel
              </button>
              <button
                id="yesButton"
                onClick={() => {
                  setOpenToggle(false);
                  handleDelete();
                }}
                className="wack"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>

        <Modal show={open} onHide={handleClose}>
          <ClientModal
            singleDoc={singleDoc}
            handleClose={handleClose}
            getUsers={getAgents}
            setShouldUpdate={setShouldUpdate}
          />
        </Modal>

        <Modal show={openSticker} onHide={handleCloseSticker}>
          <StickerModal name={singleDoc.name} user_id={singleDoc.uid} />
        </Modal>

        <Modal show={openPromo} onHide={handleClosePromo}>
          <Modal.Header closeButton>
            <Modal.Title>Agent Promotion</Modal.Title>
          </Modal.Header>
          <form onSubmit={handleAgentPromotionSubmit}>
            <Modal.Body>
              <Form.Group className="addFormGroups">
                <Form.Label htmlFor="licenseNo">
                  <p style={{ display: "flex", alignItems: "center" }}>
                    <IoMdAlert /> Promote{" "}
                    <b className="mx-1">{singleDoc.name}</b> To a supervisor
                  </p>
                </Form.Label>
                <Button variant="dark" type="submit">
                  Approve
                </Button>
              </Form.Group>
            </Modal.Body>
          </form>
        </Modal>

        {agents !== null && agents.length > 0 ? (
          <>
            <div className="shadow-sm table-card componentsData mb-3">
              <div id="search">
                <SearchBar
                  placeholder={"Search for agent's name"}
                  value={searchText}
                  handleSearch={handleSearch}
                />
                <div></div>
                <Form.Group className="mt-1 categories" width="180px">
                  <Form.Select
                    aria-label="User role"
                    id="category"
                    onChange={({ target: { value } }) =>
                      setSwitchCategory(value)
                    }
                  >
                    <option value={""}>Filter by category</option>
                    <option value="mtp">MTP</option>
                    <option value="comprehensive">Comprehensive</option>
                    <option value="windscreen">Windscreen</option>
                    <option value="newImports">New Imports</option>
                    <option value="transit">Transit</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {paginatedShownAgent.length > 0 ? (
                <>
                  <Table hover striped responsive>
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            id="onlyagent"
                            onChange={() =>
                              handleAllCheck(agents, setDeleteArray)
                            }
                          />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Category</th>
                        <th>Gender</th>
                        <th>Contact</th>
                        <th>Address</th>
                        {authClaims.admin && <th>Added by</th>}
                        <th>Created By</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedShownAgent.map((agent, index) => (
                        <tr key={agent.uid}>
                          <td>
                            <input
                              type="checkbox"
                              id="firstAgentCheckbox"
                              className="agentCheckbox"
                              onChange={({ target }) => {
                                document.getElementById(
                                  "onlyagent"
                                ).checked = false;
                                return target.checked
                                  ? setDeleteArray([
                                      ...deleteArray,
                                      [agent.uid, agent.name],
                                    ])
                                  : setDeleteArray(
                                      deleteArray.filter(
                                        (element) => element[0] !== agent.uid
                                      )
                                    );
                              }}
                            />
                          </td>
                          <td>{agent.name}</td>
                          <td>{agent.email}</td>
                          <td>
                            {agent.role.mtp && <div>MTP</div>}
                            {agent.role.comprehensive && (
                              <div>Comprehensive</div>
                            )}
                            {agent.role.windscreen && <div>Windscreen</div>}
                            {agent.role.newImport && <div>New Import</div>}
                            {agent.role.transit && <div>Transit</div>}
                          </td>
                          <td>{agent.meta.gender}</td>
                          <td>{agent.meta.phone}</td>
                          <td>{agent.meta.address}</td>
                          {authClaims.admin && (
                            <td>{agent.meta.added_by_name}</td>
                          )}
                          <td>{agent.meta.added_by_name}</td>

                          <td className="started">
                            <button
                              className="sharebtn"
                              onClick={() => {
                                setClickedIndex(index);
                                setShowContext(!showContext);
                                setSingleDoc(agent);
                              }}
                            >
                              &#8942;
                            </button>

                            <ul
                              id="mySharedown"
                              className={
                                showContext && index === clickedIndex
                                  ? "mydropdown-menu show"
                                  : "mydropdown-menu"
                              }
                              onClick={(event) => event.stopPropagation()}
                            >
                              <li
                                onClick={() => {
                                  setShowContext(false);
                                  handleOpenSticker();
                                }}
                              >
                                <div className="actionDiv">
                                  <i>
                                    <MdStickyNote2 />
                                  </i>{" "}
                                  Issued Stickers
                                </div>
                              </li>
                              <li
                                onClick={() => {
                                  setShowContext(false);
                                  handleOpen();
                                }}
                              >
                                <div className="actionDiv">
                                  <i>
                                    <MdEdit />
                                  </i>{" "}
                                  Edit
                                </div>
                              </li>
                              <li
                                onClick={() => {
                                  setShowContext(false);
                                  handleOpenPromo();
                                }}
                              >
                                <div className="actionDiv">
                                  <i>
                                    <FaUserPlus />
                                  </i>{" "}
                                  Promotion
                                </div>
                              </li>
                              <li
                                onClick={() => {
                                  setOpenToggle(true);
                                  setShowContext(false);
                                }}
                              >
                                <div className="actionDiv">
                                  <i>
                                    <MdDelete />
                                  </i>{" "}
                                  Delete
                                </div>
                              </li>
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr
                        style={{
                          border: "1px solid white",
                          borderTop: "1px solid #000",
                        }}
                      >
                        <td colSpan={3} style={{ paddingLeft: 0 }}>
                          <div style={{ display: "flex" }}>
                            <Form.Select
                              aria-label="User role"
                              id="category"
                              onChange={(event) =>
                                setBulkDelete(event.target.value)
                              }
                            >
                              <option value="">Bulk Action</option>
                              <option value="delete">Delete</option>
                            </Form.Select>
                            <button
                              className="btn cta mx-2"
                              onClick={handleBulkDelete}
                            >
                              Apply
                            </button>
                          </div>
                        </td>
                        <td colSpan={4}>
                          <Pagination
                            pages={totalPagesNum}
                            setCurrentPage={setCurrentPage}
                            currentClients={currentAgents}
                            sortedEmployees={agents}
                            entries={"Agents"}
                          />
                        </td>
                      </tr>
                    </tfoot>

                    <tfoot>
                      <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Category</th>
                        <th>Gender</th>
                        <th>Contact</th>
                        <th>Address</th>
                        {authClaims.admin && <th>Added by</th>}
                        <th>Created By</th>
                        <th>Action</th>
                      </tr>
                    </tfoot>
                  </Table>
                </>
              ) : (
                <div className="no-table-data">
                  <i>
                    <ImFilesEmpty />
                  </i>
                  <h4>No match</h4>
                  <p>There is no match for current search</p>
                </div>
              )}
            </div>
          </>
        ) : agents === null ? (
          <div className="no-table-data">
            <i>
              <ImFilesEmpty />
            </i>
            <h4>No data yet</h4>
            <p>You have not added any client Yet</p>
          </div>
        ) : (
          <Loader />
        )}
      </div>
    </>
  );
}

export default Agents;
