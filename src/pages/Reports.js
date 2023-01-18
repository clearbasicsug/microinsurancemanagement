import { useEffect, useState } from "react";
import { MdDownload } from "react-icons/md";
import SearchBar from "../components/searchBar/SearchBar";
import Header from "../components/header/Header";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../helpers/firebase";
import { Table, Form } from "react-bootstrap";
import Pagination from "../helpers/Pagination";
import { currencyFormatter } from "../helpers/currency.format";
import Loader from "../components/Loader";
import { ImFilesEmpty } from "react-icons/im";
import { httpsCallable } from "firebase/functions";
import { authentication, functions } from "../helpers/firebase";
import { generateReport } from "../helpers/generateReport";
import useAuth from "../contexts/Auth";
import useMediaQuery from "../hooks/useMediaQuery";
import { convertStringToDate } from "../helpers/helpfulUtilities";
import { FaSortDown, FaSortUp } from "react-icons/fa";

import "../styles/ctas.css";

function Reports({ parent_container }) {
  useEffect(() => {
    document.title = "Reports - SWICO";
    getPolicies();

    return () => getPolicies();
  }, []);

  // policies
  const [policies, setPolicies] = useState([]);
  const policyCollectionRef = collection(db, "policies");

  const { authClaims } = useAuth();

  const getPolicies = async () => {
    const data = await getDocs(policyCollectionRef);
    const policiesArray = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const listUsers = httpsCallable(functions, "listUsers");

    listUsers().then(({ data }) => {
      if (authClaims.agent) {
        const agentPolicies = policiesArray.filter(
          (policy) => policy.added_by_uid === authentication.currentUser.uid
        );
        agentPolicies.length === 0
          ? setPolicies(null)
          : setPolicies(agentPolicies);
      } else if (authClaims.supervisor) {
        const myAgents = data
          .filter((user) => user.role.agent === true)
          .filter(
            (agent) =>
              agent.meta.added_by_uid === authentication.currentUser.uid
          )
          .map((agentuid) => agentuid.uid);

        const usersUnderSupervisor = [
          ...myAgents,
          authentication.currentUser.uid,
        ];

        const supervisorPolicies = policiesArray.filter((policy) =>
          usersUnderSupervisor.includes(policy.added_by_uid)
        );
        supervisorPolicies.length === 0
          ? setPolicies(null)
          : setPolicies(supervisorPolicies);
      } else if (authClaims.admin) {
        const myAgents = data
          .filter((user) => user.role.agent === true)
          .filter(
            (agent) =>
              agent.meta.added_by_uid === authentication.currentUser.uid
          )
          .map((agentuid) => agentuid.uid);

        const mySupervisors = data
          .filter((user) => user.role.supervisor === true)
          .filter(
            (supervisor) =>
              supervisor.meta.added_by_uid === authentication.currentUser.uid
          )
          .map((supervisoruid) => supervisoruid.uid);

        const agentsUnderMySupervisors = data
          .filter((user) => user.role.agent === true)
          .filter((agent) => mySupervisors.includes(agent.meta.added_by_uid))
          .map((agentuid) => agentuid.uid);

        const usersUnderAdmin = [
          ...myAgents,
          ...agentsUnderMySupervisors,
          ...mySupervisors,
          authentication.currentUser.uid,
        ];

        const AdminPolicies = policiesArray.filter((policy) =>
          usersUnderAdmin.includes(policy.added_by_uid)
        );
        AdminPolicies.length === 0
          ? setPolicies(null)
          : setPolicies(AdminPolicies);
      } else if (authClaims.superadmin) {
        policiesArray.length === 0
          ? setPolicies(null)
          : setPolicies(policiesArray);
      }

      const myAgents = data
        .filter((user) => user.role.agent === true)
        .filter(
          (agent) => agent.meta.added_by_uid === authentication.currentUser.uid
        )
        .map((agentuid) => agentuid.uid);

      const mySupervisors = data
        .filter((user) => user.role.supervisor === true)
        .filter(
          (supervisor) =>
            supervisor.meta.added_by_uid === authentication.currentUser.uid
        )
        .map((supervisoruid) => supervisoruid.uid);

      const agentsUnderMySupervisors = data
        .filter((user) => user.role.agent === true)
        .filter((agent) => mySupervisors.includes(agent.meta.added_by_uid))
        .map((agentuid) => agentuid.uid);

      const usersUnderAdmin = [
        ...myAgents,
        ...agentsUnderMySupervisors,
        ...mySupervisors,
        authentication.currentUser.uid,
      ];

      const AdminPolicies = policiesArray.filter((policy) =>
        usersUnderAdmin.includes(policy.added_by_uid)
      );
      AdminPolicies.length === 0
        ? setPolicies(null)
        : setPolicies(AdminPolicies);
    });
  };

  // TODO: look for a better way to switch between categories
  const [switchCategory, setSwitchCategory] = useState("");
  // current month
  const currentMonth = new Date().getMonth();
  const monthOfYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  let today;
  if (new Date().getMonth() + 1 < 10) {
    today = `${new Date().getFullYear()}-0${
      new Date().getMonth() + 1
    }-${new Date().getDate()}`;
  } else {
    today = `${new Date().getFullYear()}-${
      new Date().getMonth() + 1
    }-${new Date().getDate()}`;
  }

  const [currentDay, setCurrentDay] = useState(null);

  // search by Name
  const [searchText, setSearchText] = useState("");
  const handleSearch = ({ target }) => setSearchText(target.value);
  const searchByName = (data) =>
    data
      .filter((row) => row.clientDetails)
      .filter(
        (row) =>
          row.clientDetails.name
            .toLowerCase()
            .indexOf(searchText.toLowerCase()) > -1
      );

  let basicTotal = 0;
  let vatTotal = 0;
  let stumpDutyTotal = 0;
  let stickerFeeTotal = 0;
  let commissionTotal = 0;
  let trainingLevy = 0;

  let basicCurrentTotal = 0;
  let vatCurrentTotal = 0;
  let stumpDutyCurrentTotal = 0;
  let stickerFeeCurrentTotal = 0;
  let commissionCurrentTotal = 0;
  let trainingCurrentLevy = 0;

  !policies ||
    policies.map(
      (policy) =>
        !policy.stickersDetails ||
        (basicTotal += +policy.stickersDetails[0].totalPremium)
    ); // grand total for all policies
  !policies ||
    policies.map((policy) => !policy.stickersDetails || (vatTotal += 1080)); // grand total for all policies
  !policies ||
    policies.map(
      (policy) => !policy.stickersDetails || (stumpDutyTotal += 35000)
    ); // grand total for all policies
  !policies ||
    policies.map(
      (policy) => !policy.stickersDetails || (stickerFeeTotal += 6000)
    ); // grand total for all policies
  !policies ||
    policies.map(
      (policy) => !policy.stickersDetails || (commissionTotal += 2191)
    ); // grand total for all policies
  !policies ||
    policies.map(
      (policy) =>
        !policy.stickersDetails ||
        (trainingCurrentLevy += +policy.stickersDetails[0].trainingLevy)
    ); // grand total for all policies

  // {policy.stickersDetails && <td>{currencyFormatter(policy.stickersDetails[0].totalPremium)}</td>}

  // filter by range
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [switchStatus, setSwitchStatus] = useState(null);
  const [sortBasicAsc, setSortBasicAsc] = useState(false);
  const [sortBasicDes, setSortBasicDes] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [policiesPerPage] = useState(10);
  const indexOfLastPolicy = currentPage * policiesPerPage;
  const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
  const currentPolicies =
    !policies ||
    searchByName(
      policies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );

  let shownPolicies =
    !policies ||
    currentPolicies
      .filter((policy) => !switchCategory || policy.category === switchCategory)
      .filter(
        (policy) =>
          (!currentDay && policy.policyStartDate !== undefined) ||
          policy.policyStartDate === currentDay
      )
      .filter(
        (policy) =>
          (!selectedMonth && policy.policyStartDate !== undefined) ||
          policy.policyStartDate.substring(5, 7) === selectedMonth
      )
      .filter(
        (policy) =>
          !selectedYear ||
          policy.policyStartDate.substring(0, 4) === selectedYear
      )
      .filter((policy) => !dateFrom || policy.policyStartDate >= dateFrom)
      .filter((policy) => !dateTo || policy.policyStartDate <= dateTo)
      .filter(
        (policy) =>
          !switchStatus || policy.stickersDetails[0].status === switchStatus
      )
      .sort(
        (a, b) =>
          convertStringToDate(b.createdAt) - convertStringToDate(a.createdAt)
      );

  if (sortBasicAsc) {
    shownPolicies = shownPolicies.sort(
      (a, b) =>
        b.stickersDetails[0].totalPremium - a.stickersDetails[0].totalPremium
    );
  }
  if (sortBasicDes) {
    shownPolicies = shownPolicies.sort(
      (a, b) =>
        a.stickersDetails[0].totalPremium - b.stickersDetails[0].totalPremium
    );
  }

  let paginatedShownPolicies =
    !policies || shownPolicies.slice(indexOfFirstPolicy, indexOfLastPolicy);

  const totalPagesNum =
    !policies || Math.ceil(shownPolicies.length / policiesPerPage);

  const isMobile = useMediaQuery("(max-width: 760px)");

  // console.log(isMobile)

  /* const sortByBasicPremium = () => {
      setShownPolicies2(shownPolicies.sort((a, b) => b.stickersDetails[0].totalPremium - a.stickersDetails[0].totalPremium))
  } */

  // console.log(shownPolicies)

  return (
    <div className="components">
      <Header title="Reports" subtitle="MANAGING REPORTS" />

      {policies !== null && policies.length > 0 ? (
        <>
          <div
            className="componentsData  shadow-sm table-card mb-3"
            style={{
              overflowX: "hidden",
            }} /* style={{ "maxWidth": "80vw", margin: "auto" }} */
          >
            <div id="search">
              <SearchBar
                placeholder={"Search for Report"}
                value={searchText}
                handleSearch={handleSearch}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => generateReport("myTable")}
                  className="tw-bg-gray-900 tw-text-white px-3 py-2 tw-rounded tw-flex tw-gap-2 tw-items-center"
                >
                  Export <MdDownload />
                </button>
              </div>
            </div>

            <div
              style={{ display: "flex", alignItems: "center" }}
              id="group-1-reports"
            >
              <Form.Group className="categories" width="180px">
                <Form.Label htmlFor="category">Policy Category</Form.Label>
                <Form.Select
                  aria-label="User role"
                  id="category"
                  onChange={({ target: { value } }) => setSwitchCategory(value)}
                >
                  <option value={""}>Select a category</option>
                  <option value="mtp">MTP</option>
                  <option value="comprehensive">Comprehensive</option>
                  <option value="windscreen">Windscreen</option>
                  <option value="newImport">New Import</option>
                  <option value="transit">Transit</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="m-3 categories" width="200px">
                <Form.Label htmlFor="category">Status</Form.Label>
                <Form.Select
                  aria-label="User role"
                  id="category"
                  onChange={({ target: { value } }) => setSwitchStatus(value)}
                >
                  <option value={""}>Select a status</option>
                  <option value="new">New</option>
                  <option value="renewed">Renewed</option>
                  <option value="paid">Paid</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="deleted">Deleted</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <Form.Group
                controlId="formGridEmail"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
              >
                <Form.Label>Daily</Form.Label>
                <Form.Control
                  type="date"
                  onChange={({ target: { value } }) => setCurrentDay(value)}
                />
              </Form.Group>

              <Form.Group className="m-3" width="150px">
                <Form.Label htmlFor="category">Select Month</Form.Label>
                <Form.Select
                  aria-label="User role"
                  id="category"
                  onChange={(event) => setSelectedMonth(event.target.value)}
                >
                  <option value={""}>Select a month</option>
                  <option value={"01"}>January</option>
                  <option value={"02"}>February</option>
                  <option value={"03"}>March</option>
                  <option value={"04"}>April</option>
                  <option value={"05"}>May</option>
                  <option value={"06"}>June</option>
                  <option value={"07"}>July</option>
                  <option value={"08"}>August</option>
                  <option value={"09"}>september</option>
                  <option value={"10"}>October</option>
                  <option value={"11"}>november</option>
                  <option value={"12"}>December</option>
                </Form.Select>
              </Form.Group>

              {!isMobile && (
                <>
                  <Form.Group className="m-3" width="150px">
                    <Form.Label htmlFor="category">Year</Form.Label>
                    <Form.Select
                      aria-label="User role"
                      id="category"
                      onChange={(event) => setSelectedYear(event.target.value)}
                    >
                      <option value="">Select a year</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                      <option value="2019">2019</option>
                      <option value="2018">2018</option>
                      <option value="2017">2017</option>
                    </Form.Select>
                  </Form.Group>

                  <div style={{ diplay: "flex", flexDirection: "row" }}>
                    <Form.Label>Date Range</Form.Label>

                    <div className="dateRange">
                      {/* <span>From</span> */}

                      <input
                        type="text"
                        style={{ width: "120px" }}
                        onFocus={() =>
                          (document.getElementById("changeDate").type = "date")
                        }
                        id="changeDate"
                        onBlur={() =>
                          (document.getElementById("changeDate").type = "text")
                        }
                        placeholder="Start date"
                        onChange={({ target: { value } }) => setDateFrom(value)}
                      />

                      {/* <span>To</span> */}

                      <input
                        type="text"
                        style={{ width: "120px" }}
                        onFocus={() =>
                          (document.getElementById("changeDate2").type = "date")
                        }
                        id="changeDate2"
                        onBlur={() =>
                          (document.getElementById("changeDate2").type = "text")
                        }
                        placeholder="- End date"
                        onChange={({ target: { value } }) => setDateTo(value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {shownPolicies.length > 0 ? (
              <>
                <Table striped hover responsive id="myTable">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #000" }}>
                      {switchCategory === "" && (
                        <th colSpan={20} style={{ textAlign: "center" }}>
                          {`All Reports`.toUpperCase()}
                        </th>
                      )}
                      {switchCategory === "mtp" && (
                        <th colSpan={20} style={{ textAlign: "center" }}>
                          {`MTP Report`.toUpperCase()}
                        </th>
                      )}
                      {switchCategory === "comprehensive" && (
                        <th colSpan={20} style={{ textAlign: "center" }}>
                          {`comprehensive Report`.toUpperCase()}
                        </th>
                      )}
                      {switchCategory === "windscreen" && (
                        <th colSpan={20} style={{ textAlign: "center" }}>
                          {`windscreen Report`.toUpperCase()}
                        </th>
                      )}
                      {switchCategory === "newImports" && (
                        <th colSpan={20} style={{ textAlign: "center" }}>
                          {`new import Report`.toUpperCase()}
                        </th>
                      )}
                      {switchCategory === "transit" && (
                        <th colSpan={20} style={{ textAlign: "center" }}>
                          {`transit Report`.toUpperCase()}
                        </th>
                      )}
                    </tr>
                    <tr>
                      <th>#</th>
                      <th>Policy Holder</th>
                      <th>PlateNo.</th>
                      <th>Car Make</th>
                      <th>Seating Capacity</th>
                      <th>G.weight</th>
                      <th>Sticker No.</th>
                      <th>Category</th>
                      <th>Cover Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Validity</th>
                      <th>
                        Basic Premium
                        <button
                          className="sortButton"
                          onClick={() => {
                            setSortBasicAsc(true);
                            setSortBasicDes(false);
                          }}
                        >
                          <FaSortUp />
                        </button>
                        <button
                          className="sortButton"
                          onClick={() => {
                            setSortBasicDes(true);
                            setSortBasicAsc(false);
                          }}
                        >
                          <FaSortDown />
                        </button>
                      </th>
                      <th>Training Levy</th>
                      <th>Sticker Fees</th>
                      <th>VAT Charge</th>
                      <th>Stamp Duty</th>
                      <th>Gross Commission</th>
                      <th>Issuing Branch</th>
                      <th>Issuing Officer</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedShownPolicies.map((policy, index) => {
                      basicCurrentTotal +=
                        +policy.stickersDetails[0].totalPremium; // total for currentPolicies
                      vatCurrentTotal += 1080; // total for  currentPolicies
                      stumpDutyCurrentTotal += 35000; // total for currentPolicies
                      stickerFeeCurrentTotal += 6000; // total for currentPolicies
                      commissionCurrentTotal += 2191; // total for currentPolicies
                      trainingLevy += +policy.stickersDetails[0].trainingLevy;

                      return (
                        <tr key={policy.id}>
                          <td>{indexOfFirstPolicy + index + 1}</td>
                          {policy.clientDetails && (
                            <td>{policy.clientDetails.name}</td>
                          )}
                          {policy.stickersDetails && (
                            <td>{policy.stickersDetails[0].plateNo}</td>
                          )}
                          {policy.stickersDetails && (
                            <td>{policy.stickersDetails[0].motorMake}</td>
                          )}
                          {policy.stickersDetails && (
                            <td>{policy.stickersDetails[0].seatingCapacity}</td>
                          )}
                          {policy.stickersDetails && (
                            <td>{policy.stickersDetails[0].grossWeight}</td>
                          )}
                          <td>{index + 3}</td>
                          <td>{policy.category}</td>
                          <td>cover</td>
                          <td>{policy.policyStartDate}</td>
                          <td>{policy.policyEndDate}</td>
                          <td>1 YR(s)</td>
                          {policy.stickersDetails && (
                            <td>
                              {currencyFormatter(
                                policy.stickersDetails[0].totalPremium
                              )}{" "}
                              {typeof policy.currency === "string"
                                ? policy.currency
                                : ""}
                            </td>
                          )}
                          {policy.stickersDetails && (
                            <td>
                              {currencyFormatter(
                                policy.stickersDetails[0].trainingLevy
                              )}{" "}
                              {typeof policy.currency === "string"
                                ? policy.currency
                                : ""}
                            </td>
                          )}
                          <td>
                            6,000{" "}
                            {typeof policy.currency === "string"
                              ? policy.currency
                              : ""}
                          </td>
                          {policy.stickersDetails && (
                            <td>
                              {currencyFormatter(policy.stickersDetails[0].vat)}{" "}
                              {typeof policy.currency === "string"
                                ? policy.currency
                                : ""}
                            </td>
                          )}
                          <td>
                            35,000{" "}
                            {typeof policy.currency === "string"
                              ? policy.currency
                              : ""}
                          </td>
                          <td>
                            2,191{" "}
                            {typeof policy.currency === "string"
                              ? policy.currency
                              : ""}
                          </td>
                          <td>branch location</td>
                          <td>{policy.added_by_name}</td>
                          {/* <td>{typeof policy.currency === "string" ? policy.currency : ''}</td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Grand Total</th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th>{currencyFormatter(basicTotal)}</th>
                      <th>{currencyFormatter(trainingLevy)}</th>
                      <th>{currencyFormatter(stickerFeeTotal)}</th>
                      <th>{currencyFormatter(vatTotal)}</th>
                      <th>{currencyFormatter(stumpDutyTotal)}</th>
                      <th>{currencyFormatter(commissionTotal)}</th>
                      <th></th>
                      <th></th>
                    </tr>
                  </tfoot>

                  <tfoot>
                    <tr>
                      <td>Subtotal Total</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{currencyFormatter(basicCurrentTotal)}</td>
                      <td>{currencyFormatter(trainingCurrentLevy)}</td>
                      <td>{currencyFormatter(stickerFeeCurrentTotal)}</td>
                      <td>{currencyFormatter(vatCurrentTotal)}</td>
                      <td>{currencyFormatter(stumpDutyCurrentTotal)}</td>
                      <td>{currencyFormatter(commissionCurrentTotal)}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </Table>
                <Pagination
                  pages={totalPagesNum}
                  setCurrentPage={setCurrentPage}
                  currentClients={paginatedShownPolicies}
                  sortedEmployees={shownPolicies}
                  entries={"Reports"}
                />
              </>
            ) : (
              <div className="no-table-data">
                <i>
                  <ImFilesEmpty />
                </i>
                <h4>No match</h4>
                <p>No stickers Yet</p>
              </div>
            )}
          </div>
        </>
      ) : policies === null ? (
        <div className="no-table-data">
          <i>
            <ImFilesEmpty />
          </i>
          <h4>No data yet</h4>
          <p>No Stickers Yet</p>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}

export default Reports;
