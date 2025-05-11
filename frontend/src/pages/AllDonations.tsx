import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, PackageCheck, Clock, ClipboardList, User } from "lucide-react";

interface Donation {
  _id: string;
  title: string;
  category: string;
  quantityToDonation: number;
  unit: string;
  status: string;
  expirationDate: string;
  donorId: string;
  donorName?: string;
}

const AllDonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/foodItem/getAllDonationFood");
        const donationsWithUsernames = await Promise.all(
          response.data.map(async (donation: Donation) => {
            if (donation.donorId) {
              try {
                const userResponse = await axios.get(`http://localhost:5000/api/users/getUser/${donation.donorId}`);
                donation.donorName = userResponse.data.username;
              } catch {
                donation.donorName = "Unknown";
              }
            } else {
              donation.donorName = "Unknown";
            }
            return donation;
          })
        );
        setDonations(donationsWithUsernames);
      } catch (err) {
        setError("Failed to fetch donations");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-4 text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 mt-10">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pt-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-blue-600" />
        <span>All Donations</span>
      </h2>

      {donations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="flex justify-center mb-4">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No donations found</h3>
          <p className="text-gray-500">No items have been donated yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {donations.map((donation) => (
            <li
              key={donation._id}
              className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <PackageCheck className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <h3 className="text-md font-semibold text-gray-800 mb-1">
                    {donation.title}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Category: {donation.category}</p>
                    <p>
                      Quantity: {donation.quantityToDonation} {donation.unit}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Expiration Date: {formatDate(donation.expirationDate)}
                    </p>
                    <p className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Donor: {donation.donorName || "Unknown"}
                    </p>
                  </div>
                </div>

                <div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusStyle(donation.status)}`}
                  >
                    {donation.status}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllDonations;