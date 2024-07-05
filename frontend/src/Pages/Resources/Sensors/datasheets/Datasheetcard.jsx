import React, { useState, useEffect } from "react";

export const Datasheetcard = ({ resoPost }) => {
  const [author, setAuthor] = useState(null);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/details/${userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await fetchUserData(resoPost.postedBy);
        setAuthor(userData); // Set author data
        console.log(userData);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };

    fetchAuthor();
  }, [resoPost.postedBy]);

  return (
    <div className="res-post">

        <div className="resuserdetails">
          {author && (
            <div className="authorInfo">
              <img
                src={author.profilePicture}
                alt={author.username}
                className="authorProfilePicture"
              />
              <p>{author.username}</p> {/* Display author name */}
            </div>
          )}
          <p>{new Date(resoPost.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="respostcontent">
          <h3>{resoPost.title}</h3>
          {resoPost.pdf && (
        <div className="reso-post-pdf">
          <a href={resoPost.pdf} target="_blank" rel="noopener noreferrer">
            Download PDF
          </a>
        </div>
      )}
        </div>
    </div>
  );
};

export default Datasheetcard;