import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { getDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../../helpers/firebase";
import "./PolicyDetails.css";
import Header from "../../components/header/Header";
import { currencyFormatter } from "../../helpers/currency.format";
import { toast } from "react-toastify";
import { Formik } from "formik";

function PolicyRenew() {
  useEffect(() => {
    document.title = "Sticker Details - SWICO";
    getMTP();

    return () => {};
  }, []);

  const { id } = useParams();

  const [policy, setPolicy] = useState({});
  const policyCollectionRef = collection(db, "policies");

  const getMTP = async () => {
    const policyRef = doc(db, "policies", id);
    const data = await getDoc(policyRef);
    setPolicy(data.data());
  };

  const modalSubmit = async (event) => {
    event.preventDefault();
    const policyRef = doc(db, "policies", id);

    await updateDoc(policyRef, {
      policyStartDate: event.target.policyStartDate.value,
      stickersDetails: [
        {
          basicPremium: "",
          category: policy.stickersDetails[0].category,
          ccPower: policy.stickersDetails[0].ccPower,
          chasisNo: policy.stickersDetails[0].chasisNo,
          grossWeight: policy.stickersDetails[0].grossWeight,
          motorClass: policy.stickersDetails[0].motorClass,
          motorMake: policy.stickersDetails[0].motorMake,
          plateNo: policy.stickersDetails[0].plateNo,
          referenceNo: policy.stickersDetails[0].referenceNo,
          seatingCapacity: policy.stickersDetails[0].seatingCapacity,
          stampDuty: policy.stickersDetails[0].stampDuty,
          status: "renewed",
          stickerFee: policy.stickersDetails[0].stickerFee,
          totalPremium: policy.stickersDetails[0].totalPremium,
          trainingLevy: policy.stickersDetails[0].trainingLevy,
          vat: policy.stickersDetails[0].vat,
          vehicleUse: policy.stickersDetails[0].vehicleUse,
        },
      ],
    }).then(() =>
      toast.success("Successfully renewed", { position: "top-center" })
    );
    getMTP();
  };

  return (
    <div className="components">
      <Header title="Renew Policy" subtitle="STICKER RENEW" />

      <form
        className="table-card componentsData shadow-sm"
        onSubmit={modalSubmit}
      >
        <div style={{ width: "100%", padding: "20px" }}>
          <div className="tw-flex tw-flex-col">
            <label htmlFor="policyStartDate tw-mt-3">
              Select the renewal Start Date and submit policy
            </label>
            <input
              type="date"
              id="policyStartDate"
              className="tw-outline tw-outline-1 px-3 py-2 tw-rounded focus:tw-outline focus:tw-outline-1"
              required
            />
          </div>
        </div>

        <div style={{ margin: "30px" }}>
          <div className="fromTo">
            <div id="from">
              <b>Statewide Insurance</b>
              <p>Plot 1, Bombo Road</p>
              <p>Kampala, Uganda</p>
              <p>C: swico@swico.co.ug</p>
            </div>
            {policy.clientDetails != undefined && (
              <div id="to">
                <p>
                  To: <b>{policy.clientDetails.name}</b>
                </p>
                <p>Address: {policy.clientDetails.meta.address}</p>
              </div>
            )}
            {policy.policyStartDate != undefined && (
              <div id="date">
                <p>
                  <b>Start Date</b> {policy.policyStartDate}
                </p>
                <p>
                  <b>End Date</b> {policy.policyEndDate}
                </p>
              </div>
            )}
          </div>
          {policy.clientDetails != undefined && (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ padding: "10px 20px" }}>Motor Type</th>
                    <th>Chassis No.</th>
                    <th>Plate No.</th>
                    <th>No. of seats</th>
                    <th>Power(CC)</th>
                    <th>Use</th>
                  </tr>
                </thead>
                <tbody style={{ padding: "5px" }}>
                  <tr>
                    <td style={{ padding: "20px" }}>
                      {policy.stickersDetails[0].motorMake}
                    </td>
                    <td>{policy.stickersDetails[0].chasisNo}</td>
                    <td>{policy.stickersDetails[0].plateNo}</td>
                    <td>{policy.stickersDetails[0].seatingCapacity}</td>
                    <td>{policy.stickersDetails[0].ccPower}</td>
                    <td>{policy.stickersDetails[0].vehicleUse}</td>
                  </tr>
                </tbody>
              </table>
              <b>Cost of Insurance</b>
              <hr></hr>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p>Total Premium:</p>{" "}
                <span style={{ marginRight: "12rem" }}>
                  <b>{policy.currency} </b>
                  {currencyFormatter(policy.stickersDetails[0].totalPremium)}
                </span>
              </div>
              <hr></hr>
            </>
          )}
          <p>
            <span className="prepared">Prepared by </span>
            <b>{policy.added_by_name}</b>
          </p>
          <input type="submit" className="btn-success" value="Renew Policy" />
        </div>
      </form>
    </div>
  );
}

export default PolicyRenew;
