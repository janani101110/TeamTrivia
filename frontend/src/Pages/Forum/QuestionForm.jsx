import React, { useState , useEffect} from 'react';
import './QuestionForm.css';
import axios from 'axios';
import { imageDb } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../Context/UserContext';


const QuestionForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [viewCount] = useState(0);
  const { user } = useUsers();
  const [postedBy, setPostedBy] = useState("");

  useEffect(() => {
    if (user) {
      setPostedBy(user._id); 
    }
  }, [user]);




  // Function to upload photo for preview post
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  // Function to format date to time ago format
   

  // Button click
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let downloadURL = "";

      if (file) {
        const imgRef = ref(imageDb, `questionImage/${v4()}`);
        await uploadBytes(imgRef, file);
        downloadURL = await getDownloadURL(imgRef);
        console.log("Download URL:", downloadURL);
      }

      // Create a new question object
      const newQuestion = {
        title,
        description,
        viewCount,
        date: new Date().toISOString(),
        postedBy:postedBy,
         
      };

      // Add imageUrl to the question object if an image is uploaded 
      if (downloadURL) {
        newQuestion.imageUrl = downloadURL;
      }

      // Send the question data to your backend
      const res = await axios.post("http://localhost:5000/api/questions/create", newQuestion, {
        withCredentials: true,
      });
      console.log(res.data);

      // Navigate to forum after successful submission
      navigate("/forum");
    } catch (err) {
      console.error("Error submitting question:", err);
    }

  

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`, // Set the authorization token in headers
      },
      body: JSON.stringify(QuestionForm), // Convert blog post object to JSON string
    };

    try {
      const res = await fetch(
        "http://localhost:5000/api/newQuestion/create",
        requestOptions
      );
      if (!res.ok) {
        throw new Error("Failed to create question");
      }
      const data = await res.json();
      console.log(data);
      navigate("/forum");
    } catch (err) {
      console.error(err);
    }
    
  };
// Function to retrieve token from local storage
const getToken = () => {
  return localStorage.getItem("token");
};
  return (
    <div className='questionForm'>
      <h1>Ask Your Question</h1>
      <div className='formBody'>
        <form className='forumform' onSubmit={handleSubmit}>
          <table className='forumTable'>
            <thead> 
              <tr>
                <td>
                  <input 
                    type='text' 
                    name='title' 
                    value={title} 
                    placeholder='Enter Your Question Title' 
                    onChange={(e) => setTitle(e.target.value)} 
                    style={{ width: "615px", height: "50px", marginTop: "10px",border: "none", padding: "5px" }} 
                  />
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <textarea 
                    name='description' 
                    value={description} 
                    cols={80} 
                    rows={25} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder='Write Your Question' 
                    style={{ padding: "5px" }}>
                  </textarea>
                </td>
              </tr>
              <tr>
                <td>
                  <input type='file' onChange={handlePhotoChange} />
                </td>
              </tr>
            </tbody>
          </table>
          <button className='formsubmitbutton' type='submit'>Add Question</button>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;