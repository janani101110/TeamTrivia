import React, { useState, useEffect } from "react";
import { URL } from "../../../../url";
import axios from "axios";
import "./../../Writepost.css";
import { useNavigate } from "react-router-dom";
import { ImCross } from "react-icons/im";
import { imageDb } from "../../../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { useUsers } from "../../../../Context/UserContext";
import 'react-quill/dist/quill.snow.css';

const categoriesList = {
  "Data Sheets": [
    "All Categories",
    "Sensor Data Sheets",
    "Microcontroller Data Sheets",
    "Communication Module Data Sheets",
    "Power Management IC Data Sheets",
    "Component Specifications",
  ],
};

export const DataSheetWrite = () => {
  const [postedBy, setPostedBy] = useState("");
  const [title, setTitle] = useState("");
  const [maincats, setMainCats] = useState(Object.keys(categoriesList)[0]);
  const [cats, setCats] = useState([]);
  const [pdfFile, setPdfFile] = useState(null); // State for PDF file
  const navigate = useNavigate();
  const { user } = useUsers();

  useEffect(() => {
    if (user) {
      setPostedBy(user._id);
    }
  }, [user]);

  const handlePdfChange = (e) => {
    const pdfFile = e.target.files[0];
    setPdfFile(pdfFile);
  };

  const handleMainCategoryChange = (e) => {
    const selectedMainCategory = e.target.value;
    setMainCats(selectedMainCategory);
    setCats([]); // Clear subcategories when main category changes
  };

  const handleCategoryChange = (e) => {
    addCategory(e);
  };

  const deleteCategory = (i) => {
    let updatedCats = [...cats];
    updatedCats.splice(i, 1);
    setCats(updatedCats);
  };

  const addCategory = (e) => {
    const selectedCategory = e.target.value;
    if (selectedCategory && !cats.includes(selectedCategory) && selectedCategory !== "All Categories") {
      setCats([...cats, selectedCategory]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let pdfUrl = null;
  
    if (pdfFile) {
      const pdfRef = ref(imageDb, `resourcespdfs/${v4()}`);
      try {
        await uploadBytes(pdfRef, pdfFile);
        pdfUrl = await getDownloadURL(pdfRef);
      } catch (err) {
        console.log(err);
      }
    }
  
    const resoPost = {
      title,
      maincategories: maincats,
      categories: cats,
      desc: "Data Sheets",
      pdf: pdfUrl,
      postedBy: postedBy,
    };
  
    try {
      const res = await axios.post(`${URL}/api/resoposts/create`, resoPost, {
        withCredentials: true,
      });
      console.log('Response:', res.data);
      navigate("/resources");
    } catch (err) {
      console.log('Error:', err.response ? err.response.data : err.message);
    }
  };
  

  return (
    <div className="container">
      <h1 className="title">Share Your Knowledge...!</h1>
      <form onSubmit={handleSubmit} className="form">
        <input
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          placeholder="Enter Post Title"
          className="resopostinput"
          value={title}
        />

        <div className="reso-post-categories-container">
          <div className="reso-category-input">
            <select onChange={handleMainCategoryChange} className="main-category" value={maincats}>
              {Object.keys(categoriesList).map((maincategory) => (
                <option key={maincategory} value={maincategory}>
                  {maincategory}
                </option>
              ))}
            </select>

            <select onChange={handleCategoryChange} className="resoaddcategory">
              <option value="">Sub Category</option>
              {categoriesList[maincats].map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="reso-category-list">
            {cats.map((c, i) => (
              <div key={i} className="reso-category-item">
                <p>{c}</p>
                <p onClick={() => deleteCategory(i)} className="reso-delete-button">
                  <ImCross />
                </p>
              </div>
            ))}
          </div>
        </div>

        <input onChange={handlePdfChange} type="file" accept="application/pdf" className="file-input" />

        <button type="submit" className="publish-btn">
          Publish
        </button>
      </form>
    </div>
  );
};

export default DataSheetWrite;