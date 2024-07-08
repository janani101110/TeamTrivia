import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUsers } from "../../Context/UserContext";
import Blogspost from "../Blogs/Blogspost";
import Resopost from "../Resources/Resourcepost";
import CIcon from "@coreui/icons-react";
import * as icon from "@coreui/icons";
import "./MySaves.css";
import "../Blogs/Blog.css";
import bookMarkBanner from "./Assets/bookMarkBanner.jpg";

const MySaves = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [resoPosts, setResoPosts] = useState([]);
  const [showGrid, setShowGrid] = useState(false); // State to track whether to show grid view
  const { user } = useUsers();

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        if (user && user._id) {
          const response = await axios.get(
            `http://localhost:5000/api/bookMarks/${user._id}`
          );
          
          const fetchedBlogPosts = response.data
            .filter(item => item.blogPost) // Ensure blogPost is defined
            .map(item => item.blogPost);
          setBlogPosts(fetchedBlogPosts);

          const fetchedResoPosts = response.data
            .filter(item => item.resoPost) // Ensure resoPost is defined
            .map(item => item.resoPost);
          setResoPosts(fetchedResoPosts);
        }
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error);
      }
    }; 

    fetchBookmarkedPosts();
  }, [user]);

  const handleToggleGrid = () => {
    setShowGrid(!showGrid); // Toggle the state when dropdown button is clicked
  };

  return (
    <div className="mySavesBody">
      <div className="BookMarkBanner">
        <img src={bookMarkBanner} alt="" className="BookMarkBannerImage" />
        <div className="BookMarkBannerText">Your Book Marks</div>
      </div>

      <div className="mySaveBookMarksDiv">
        <div className="mySaveBookMarksSubDiv">
          <div className="mySaveTags">
            Blogs <hr />
            <button onClick={handleToggleGrid} className="toggleButton">
              {showGrid ? (
                <CIcon
                  icon={icon.cilCaretTop}
                  size=""
                  style={{ "--ci-primary-color": "black" }}
                  className="dropdownIcon"
                />
              ) : (
                <CIcon
                  icon={icon.cilCaretBottom}
                  size=""
                  style={{ "--ci-primary-color": "black" }}
                  className="dropdownIcon"
                />
              )}
            </button>
          </div>
          <p className="UserBlogsCount">
            No of Blogs: {blogPosts.length}
          </p>
        </div>
        <div className="blogCardMyBookMarks">
          {blogPosts.length === 0 ? (
            <p>No saved blog posts found.</p>
          ) : (
            <ul>
              {/* Conditionally render the first three blog posts or all blog posts */}
              {showGrid
                ? blogPosts.map((blogPost) => (
                    <Blogspost
                      style={{ textDecoration: "none" }}
                      key={blogPost._id}
                      blogPost={blogPost}
                    />
                  ))
                : blogPosts
                    .slice(0, 3)
                    .map((blogPost) => (
                      <Blogspost
                        style={{ textDecoration: "none" }}
                        key={blogPost._id}
                        blogPost={blogPost}
                      />
                    ))}
            </ul>
          )}
        </div>
        <div className="mySaveBookMarksresoDiv">
        <div className="mySaveBookMarksresoSubDiv">
          <div className="mySaveTags">
            Resources <hr />
            <button onClick={handleToggleGrid} className="toggleButton">
              {showGrid ? (
                <CIcon
                  icon={icon.cilCaretTop}
                  size=""
                  style={{ "--ci-primary-color": "black" }}
                  className="dropdownIcon"
                />
              ) : (
                <CIcon
                  icon={icon.cilCaretBottom}
                  size=""
                  style={{ "--ci-primary-color": "black" }}
                  className="dropdownIcon"
                />
              )}
            </button>
          </div>
          <p className="UserBlogsCount">
            No of Resources: {resoPosts.length}
          </p>
        </div>
        <div className="resoCardMyBookMarks">
          {resoPosts.length === 0 ? (
            <p>No saved resource posts found.</p>
          ) : (
            <ul>
              {/* Conditionally render the first three resource posts or all resource posts */}
              {showGrid
                ? resoPosts.map((resoPost) => (
                    <Resopost
                      style={{ textDecoration: "none" }}
                      key={resoPost._id}
                      resoPost={resoPost}
                    />
                  ))
                : resoPosts
                    .slice(0, 3)
                    .map((resoPost) => (
                      <Resopost
                        style={{ textDecoration: "none" }}
                        key={resoPost._id}
                        resoPost={resoPost}
                      />
                    ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default MySaves;