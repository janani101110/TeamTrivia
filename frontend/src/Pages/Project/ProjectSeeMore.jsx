import React, { useState, useRef } from "react";
import "./ProjectSeeMore.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { URL } from "../../url";
import ProjectCard from "./ProjectCard";
// import { Element, scroller } from 'react-scroll';
// import ScrollAnimation from "react-animate-on-scroll";
// import "animate.css/animate.min.css";

import AOS from "aos";
import "aos/dist/aos.css";

export const ProjectSeeMore = () => {
  const { id } = useParams();
  const [projectpost, setProjectPost] = useState({});
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [page, setPage] = useState(1); // State to keep track of the current page
  const containerRef = useRef(null); // Reference to the container
  const wrapperRef = useRef(null); // Reference to the wrapper

  useEffect(() => {
    AOS.refreshHard(); // Refresh AOS on component mount/update
  }, [projectpost]);

  const fetchProPost = async () => {
    try {
      const res = await axios.get(`${URL}/api/projectposts/${id}`);
      setProjectPost(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRelatedProjects = async (page) => {
    try {
      if (projectpost.name) {
        const res = await axios.get(
          `${URL}/api/projectposts?name=${projectpost.name}&status=approved&page=${page}`
        );
        setRelatedProjects((prevProjects) => [
          ...prevProjects,
          ...res.data.filter((project) => project._id !== id),
        ]); // Append new projects to the existing list
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProPost();
  }, [id]);

  useEffect(() => {
    if (projectpost.name) {
      setRelatedProjects([]); // Reset related projects when a new project is loaded
      setPage(1); // Reset page to 1
      fetchRelatedProjects(1); // Fetch the first page of related projects
    }
  }, [projectpost.name]);

  const handleScroll = () => {
    if (
      containerRef.current.scrollLeft + containerRef.current.clientWidth >=
      containerRef.current.scrollWidth
    ) {
      setPage((prevPage) => prevPage + 1); // Load next page
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchRelatedProjects(page); // Fetch related projects for the next page
    }
  }, [page]);

  // Event handlers to pause and resume the scrolling animation
  const handleMouseEnter = () => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.add("paused");
    }
  };

  const handleMouseLeave = () => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.remove("paused");
    }
  };

  // Use a unique key to ensure the video element is re-rendered
  const videoKey = projectpost.project_video + new Date().getTime();

  return (
    <div className="project_seemore_container" data-aos="fade-up">
      <h1 className="project_title">{projectpost.project_name}</h1> <br></br>
      <hr className="project_line"></hr> <br></br>
      <div className="project_inline_user">
        {/*  <div className="project_userprofile"></div>*/}
        <div className="project_user">
          <p>
            Published by{" "}
            <b>
              <i>{projectpost.name}</i>
            </b>
          </p>
          <p className="project_mail">From {projectpost.email}</p>
          <p>On {new Date(projectpost.updatedAt).toString().slice(0, 15)}</p>
          <p>At {new Date(projectpost.updatedAt).toString().slice(16, 24)}</p>
        </div>
      </div>
      <br></br>
      <div className="project_image" data-aos="fade-up">
        <img src={projectpost.project_photo} alt="Avatar" width={600}></img>
        <p className="project_figure">Final output of the project</p>
      </div>
      <br></br>
      <div data-aos="fade-up">
        <div className="project_head">
          Components required for this project are:
        </div>
        <br></br>
        <div className="project_describe">{projectpost.components}</div>
      </div>
      <br></br>
      <br></br>
      <div data-aos="fade-up">
        <p className="project_head">Objectives of this project:</p> <br></br>
        <p className="project_describe">{projectpost.objectives}</p>
      </div>
      <br></br>
      <br></br>
      {/*  <div className="project_image">
        

        <Link to={projectpost.project_video}>click mee</Link> 

        <p className="project_figure">Video explanation of the project</p>
      </div> */}
      <div className="project_head" data-aos="fade-up">
        Video explanation of the project
      </div>
      <br></br>
      <div className="project_video" data-aos="fade-up">
        <video key={videoKey} width="600" controls>
          <source src={projectpost.project_video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* <p className="project_figure">Video explanation of the project</p> */}
      </div>
      <br></br>

      <div data-aos="fade-up">
        <p className="project_head">Explanation of the project:</p>
        <br></br>
        <p className="project_describe">{projectpost.explanation}</p>
      </div>
      <br></br>
      <br></br>

      <div className="project_head" data-aos="fade-up">
        Circuit Diagram
      </div>
      <br></br>
      <div className="project_image">
        <img
          src={projectpost.circuit_diagram}
          alt="Project Image"
          width={600}
        ></img>
        {/*  <p className="project_figure">Circuit Diagram</p> */}
      </div>
      <br></br>

      <div className="project_head" data-aos="fade-up">
        PCB Design
      </div>
      <br></br>
      <div className="project_image">
        <img src={projectpost.pcb_design} alt="Project Image" width={600}></img>
        {/* <p className="project_figure">PCB Design</p>*/}
      </div>
      <br></br>
      
      <div data-aos="fade-up">
        <p className="project_head">Refer the code through this GitHub link:</p>
        <br></br>
        <a
          className="project_github"
          href={projectpost.git_link}
          // href="https://github.com/flesler/jquery.scrollTo.git"
          target="_blank"
          rel="noopener noreferrer"
        >
          {projectpost.git_link}
        </a>
      </div>
      <br></br>
      <br></br>
      <hr className="project_line" data-aos="fade-up"></hr>
      {relatedProjects.length > 0 ? (
        <div
          className="related_projects_section"
          ref={containerRef}
          onScroll={handleScroll}
        >
          <br></br>
          <p className="project_head" data-aos="fade-up">
            Related Projects by {projectpost.name}
          </p>
          <br></br>
          <div
            className="related_projects_wrapper"
            ref={wrapperRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="related_projects_grid">
              {relatedProjects
                .filter(
                  (project) =>
                    project.name === projectpost.name && project.approved
                ) // Filter by user name and approval status
                .map((project) => (
                  <div className="related_project_item" key={project._id}>
                    <ProjectCard projectpost={project} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <p>No related projects to see.</p>
      )}
    </div>
  );
};

export default ProjectSeeMore;