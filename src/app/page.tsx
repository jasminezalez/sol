"use client";

import { useEffect, useState } from "react";

interface Advocate {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates")
      .then((response) => response.json())
      .then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      })
      .catch((error) => {
        console.error("Error fetching advocates:", error);
      });
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    console.log("filtering advocates...");
    const filtered = advocates.filter((advocate) => {
      const searchLower = newSearchTerm.toLowerCase();
      return (
        advocate.firstName.toLowerCase().includes(searchLower) ||
        advocate.lastName.toLowerCase().includes(searchLower) ||
        advocate.city.toLowerCase().includes(searchLower) ||
        advocate.degree.toLowerCase().includes(searchLower) ||
        advocate.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchLower)
        ) ||
        advocate.yearsOfExperience.toString().includes(searchLower)
      );
    });
    // not sure if it makes sense for the user to search by years of experience, but it was in the original code, this may be modified later

    setFilteredAdvocates(filtered);
  };

  const handleResetSearch = () => {
    console.log(advocates);
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span>{searchTerm}</span>
        </p>
        <input 
          style={{ border: "1px solid black" }} 
          value={searchTerm}
          onChange={handleSearchChange} 
          placeholder="Search advocates..."
        />
        <button onClick={handleResetSearch}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => (
            <tr key={advocate.id}>
              <td>{advocate.firstName}</td>
              <td>{advocate.lastName}</td>
              <td>{advocate.city}</td>
              <td>{advocate.degree}</td>
              <td>
                {advocate.specialties.map((specialty, index) => (
                  <div key={index}>{specialty}</div>
                ))}
              </td>
              <td>{advocate.yearsOfExperience}</td>
              <td>{advocate.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
