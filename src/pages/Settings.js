import { useEffect, useState } from "react";
import "../styles/Settings.css";
import { Form, Alert, Modal, Badge } from "react-bootstrap";
import { MdCheckCircle } from "react-icons/md";
import Header from "../components/header/Header";
import DefaultAvatar from "../components/DefaultAvatar";
import { db, authentication } from "../helpers/firebase";
import { AiOutlineEdit } from "react-icons/ai";
import useDialog from "../hooks/useDialog";
import useAuth from "../contexts/Auth";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import UpdateUser from "../components/UpdateUser";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ctas.css";

function Settings() {
  const [show, handleShow, handleClose] = useDialog();
  const [meta, setMeta] = useState({});
  const { currentUser, setCurrentUser } = getAuth();
  const { authClaims } = useAuth();
  const [shouldUpdate, setShouldUpdate] = useState(false);

  useEffect(() => {
    document.title = "User Profile - SWICO";
    getUserMeta();
    console.log("hellow")
    return () => {};
  }, [show]);

  const getUserMeta = async () => {
    const docRef = doc(db, "usermeta", currentUser.uid);
    const docSnap = await getDoc(docRef);
    setMeta(docSnap.data());
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      event.target.oldPassword.value
    );

    try {
      await reauthenticateWithCredential(currentUser, credential)
        .then(() => {
          if (event.target.password.value === event.target.newPassword.value) {
            updatePassword(currentUser, event.target.password.value)
              .then(() => {
                toast.success("Successfully updated password", {
                  position: "top-center",
                });
              })
              .catch((error) => {
                error.code === "auth/weak-password"
                  ? toast.error("Weak password", { position: "top-center" })
                  : error.code === "auth/requires-recent-login"
                  ? toast.error(
                      "This action requires you to re-login in first",
                      { position: "top-center" }
                    )
                  : toast.error("Failed, Try again", {
                      position: "top-center",
                    });
              });
          } else {
            toast.error("Password doesn't match", { position: "top-center" });
          }
          document.passwordForm.reset();
        })
        .catch((error) => {});
    } catch (error) {}
  };

  return (
    <div className="components">
      <Header title="Setting" subtitle="CUSTOMIZE YOUR ACCOUNT" />

      <Modal show={show} onHide={handleClose}>
        <UpdateUser
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          meta={meta}
          handleClose={handleClose}
          getUserMeta={getUserMeta}
        />
      </Modal>

      <div
        id="edit_profile"
        className="componentsData myProfile shadow-sm mb-3 mt-3"
      >
        <div className="mt-3">
          <h2 className="tw-font-medium tw-text-lg tw-mb-5">Profile</h2>
          <div className="profileSection">
            <div className="avatarSection">
              {authentication?.currentUser.photoURL !==
                "https://firebasestorage.googleapis.com/v0/b/car-insurance-app.appspot.com/o/default-user-image.png?alt=media&token=f9f8f8e9-f8f8-4f8f-8f8f-f8f8f8f8f8f8" &&
              authentication?.currentUser.photoURL !==
                "https://example.com/jane-doe/photo.jpg" ? (
                <img
                  src={authentication?.currentUser.photoURL}
                  alt={authentication?.currentUser.displayName}
                  width={50}
                  height={50}
                  className="tw-rounded-full tw-overflow-hidden"
                />
              ) : (
                <DefaultAvatar />
              )}
              <div>
                <h3 className="tw-text-lg tw-font-medium tw-mb-0">
                  {currentUser.displayName}
                </h3>
                <p>{currentUser.email}</p>
              </div>
            </div>
            <button
              className="tw-bg-gray-800 tw-px-3 tw-py-2 tw-text-white tw-rounded"
              onClick={handleShow}
            >
              <AiOutlineEdit />
            </button>
          </div>
        </div>

        <h3 className="tw-mt-5">General Information</h3>
        <table className="mb-3 mt-3">
          <tbody style={{ backgroundColor: "transparent" }}>
            <tr
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0 2rem",
              }}
              className="mb-2"
            >
              <th style={{ paddingRight: "10rem" }}>
                <p>Role</p>
              </th>
              {authClaims.agent && (
                <td>
                  <Badge>Agent</Badge>
                </td>
              )}
              {authClaims.supervisor && (
                <td>
                  <Badge>Supervisor</Badge>
                </td>
              )}
              {authClaims.admin && (
                <td>
                  <Badge>Admin</Badge>
                </td>
              )}
              {authClaims.superadmin && (
                <td>
                  <Badge>Super Admin</Badge>
                </td>
              )}
            </tr>
            {!authClaims.superadmin && (
              <>
                <tr
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 2rem",
                  }}
                  className="mb-2"
                >
                  <th style={{ paddingRight: "10rem" }}>
                    <p>Gender</p>
                  </th>
                  <td>
                    <p>{meta.gender}</p>
                  </td>
                </tr>
                <tr
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 2rem",
                  }}
                  className="mb-2"
                >
                  <th style={{ paddingRight: "10rem" }}>
                    <p>Address</p>
                  </th>
                  <td>
                    <p>{meta.address}</p>
                  </td>
                </tr>
                <tr
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 2rem",
                  }}
                  className="mb-2"
                >
                  <th style={{ paddingRight: "10rem" }}>
                    <p>Contact</p>
                  </th>
                  <td>
                    <p>{meta.phone}</p>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div
        id="edit_profile"
        className="componentsData myProfile shadow-sm mb-3"
      >
        <h2 className="tw-font-medium tw-text-lg tw-mb-5">Notification</h2>
        <Alert variant="success">
          <div className="tw-flex tw-items-center tw-gap-2">
            <MdCheckCircle /> You don't have any notifications
          </div>
        </Alert>
      </div>

      <div
        id="edit_profile"
        className="componentsData myProfile shadow-sm mb-3"
      >
        <form name="passwordForm" onSubmit={handlePasswordChange}>
          <h2 className="tw-font-medium tw-text-lg tw-mb-5">
            Password and Security
          </h2>
          <p className="mb-2">Change your password</p>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="oldPassword">Old Password</Form.Label>
            <Form.Control
              type="password"
              id="oldPassword"
              placeholder="Enter old password"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="newPassword">New Password</Form.Label>
            <Form.Control
              type="password"
              id="newPassword"
              placeholder="Enter new password"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="confirmPassword">Confirm Password</Form.Label>
            <Form.Control
              placeholder="Match password"
              id="password"
              type="password"
              required
            />
          </Form.Group>
          <input type="submit" value="Update Password" className="btn cta" />
        </form>
      </div>
    </div>
  );
}

export default Settings;
