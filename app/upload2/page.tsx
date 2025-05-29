"use client";

import { subSections } from "@/libs/Section";
import axios from "axios";
import { useEffect, useState } from "react";
import slugify from "slugify";
import UPLOAD from "../api/upload/Upload";
import { CONVERT } from "../api/humanizee/Convert";

// Refreshes the current page
function refreshPage() {
  location.reload();
}

function Upload2() {
  const [isRunning, setIsRunning] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [consoleData, setConsoleData] = useState<string[]>([]);

  if (successCount == 10) {
    refreshPage();
  }

  async function getRandomPath(subSections: any) {
    const firstLevel = Object.keys(subSections);
    const randomFirstLevel =
      firstLevel[Math.floor(Math.random() * firstLevel.length)];
    const secondLevel = Object.keys(subSections[randomFirstLevel]);
    const randomSecondLevel =
      secondLevel[Math.floor(Math.random() * secondLevel.length)];
    const thirdLevel = subSections[randomFirstLevel][randomSecondLevel];
    const randomThirdLevel =
      thirdLevel[Math.floor(Math.random() * thirdLevel.length)];
    return [randomFirstLevel, randomSecondLevel, randomThirdLevel];
  }

  const searchImages = async (query: string) => {
    const response = await axios.post("/api/scrape", {
      query,
    });
    return response.data.results.url;
  };

  async function startProcess() {
    try {
      // Getting random section
      setConsoleData([]);
      const path = await getRandomPath(subSections);
      console.log(`STARTED`);
      setConsoleData((prev) => [...prev, `STARTED`]);
      console.log(`section : `, path[0]);
      setConsoleData((prev) => [...prev, `section : ${path[0]}`]);
      console.log(`subSection : `, path[1]);
      setConsoleData((prev) => [...prev, `subSection : ${path[1]}`]);
      console.log(`subSubSection : `, path[2]);
      setConsoleData((prev) => [...prev, `subSubSection : ${path[2]}`]);
      console.log(`GETTING BLOG...`);
      setConsoleData((prev) => [...prev, `GETTING BLOG...`]);

      const blogs: any = await UPLOAD({
        section: path[0],
        subSection: path[1],
        subSubSection: path[2],
      });

      // const data = await blogs.data;
      const covertedBlog = await JSON.parse(blogs);
      if (
        covertedBlog.pageTitle.includes("[") ||
        covertedBlog.pageTitle.includes("]") ||
        covertedBlog.pageTitle.includes("Image Query")
      ) {
        throw new Error(
          'String contains forbidden characters "[" or "]" or "Image Query". in the Title'
        );
      }

      covertedBlog.recipeDescription.detailedDescription.map((item: any) => {
        if (
          item.description.includes("[") ||
          item.description.includes("]") ||
          item.description.includes("Image Query")
        ) {
          throw new Error(
            'String contains forbidden characters  "[" or "]" or "Image Query". in the description'
          );
        }
      });

      setConsoleData((prev) => [...prev, `GOT BLOG ${covertedBlog}`]);
      console.log(`GOT BLOG`, covertedBlog);
      setConsoleData((prev) => [...prev, `GETTING IMAGE FOR MAIN TITLE...`]);
      console.log(`GETTING IMAGE FOR MAIN TITLE...`);

      if (
        covertedBlog.imageQuery == null ||
        covertedBlog.imageQuery == "null"
      ) {
        setConsoleData((prev) => [
          ...prev,
          `GETTING IMAGE FOR MAIN TITLE FAILED`,
        ]);
        console.log(`GETTING IMAGE FOR MAIN TITLE FAILED`);
        setFailedCount((prev) => prev + 1);
        setConsoleData((prev) => [...prev, `RETRYING...`]);
        console.log(`RETRYING...`);
        startProcess();
        return;
      }
      let link;
      if (
        covertedBlog.imageQuery == null ||
        covertedBlog.imageQuery == "null"
      ) {
        console.log("Failed to have imagequery for main");
        throw new Error("Failed to have imagequery for main");
      } else {
        link = await searchImages(covertedBlog.imageQuery);
      }
      // const link = await searchImages(covertedBlog.imageQuery);
      setConsoleData((prev) => [
        ...prev,
        `GETTING IMAGE FOR MAIN TITLE SUCCESSFULL`,
      ]);

      console.log(`GETTING IMAGE FOR MAIN TITLE SUCCESSFULL`);
      setConsoleData((prev) => [...prev, `GETTING IMAGES FOR CONTENT...`]);
      console.log(`GETTING IMAGES FOR CONTENT...`);

      // let primaryKeywords = await KEYWORD(covertedBlog.seo.primaryKeywords[0]);
      // let secondaryKeywords = await KEYWORD(
      //   covertedBlog.seo.secondaryKeywords[0]
      // );
      // console.log(primaryKeywords);
      // console.log(secondaryKeywords);
      // let newseo = { ...covertedBlog.seo, primaryKeywords, secondaryKeywords };
      console.log(`oldseo`, covertedBlog.seo);

      // console.log(`newseo`, newseo);
      console.log(covertedBlog);
      const results = await Promise.all(
        covertedBlog.recipeDescription.detailedDescription?.map(
          async (item: {
            imageQuery: string;
            // title: string;
            description: string;
          }) => {
            let link;
            if (item.imageQuery == null || item.imageQuery == "null") {
              link = "null";
            } else {
              link = await searchImages(item.imageQuery);
            }
            setConsoleData((prev) => [...prev, `IMAGE GENERATED, ${link}`]);

            console.log("IMAGE GENERATED", link);

            // Function to retry humanizing content
            async function runUntilResponse(item: string) {
              let response = null;
              let count = 0;
              while (response === null) {
                if (count >= 4) {
                  throw new Error("Maximum limit reached for humanizing...");
                }
                response = await CONVERT(item); // Retry until success or max attempts
                if (response === null) {
                  count++;
                  console.log("Response is null, retrying...");
                  // await new Promise((resolve) => setTimeout(resolve, 1000)); // Optional delay
                }
              }
              console.log("Got a non-null response:", response);
              return response;
            }

            const response = await runUntilResponse(item.description);

            return {
              // title: item.title,
              description: response,
              // description: item.description,
              url: link,
              alt: item.imageQuery,
            };
          }
        )
      );

      // results.map((item: any) => {
      //   if (
      //     item.description.includes("[") ||
      //     item.description.includes("]") ||
      //     item.description.includes("}") ||
      //     item.description.includes("{") ||
      //     item.description.includes("Image Query")
      //   ) {
      //     throw new Error(
      //       'String contains forbidden characters "[" or "]" or "Image Query". in the description'
      //     );
      //   }
      // });

      setConsoleData((prev) => [
        ...prev,
        `GETTING IMAGES FOR CONTENT SUCCESSFULL`,
      ]);

      console.log(`GETTING IMAGES FOR CONTENT SUCCESSFULL`);
      setConsoleData((prev) => [...prev, `BLOG UPLOAD START...`]);
      console.log(`BLOG UPLOAD START...`);

      if (
        ((path[0],
        covertedBlog.pageTitle,
        covertedBlog.imageQuery,
        link,
        path[1],
        path[2],
        results,
        covertedBlog.author,
        covertedBlog.quote,
        covertedBlog.seo,
        covertedBlog.recipeDetails,
        covertedBlog.instructions,
        covertedBlog.recipeDescription.shortDescription),
        covertedBlog.faq,
        covertedBlog.equipments)
      ) {
        const res = await axios.post("/api/dbupload", {
          section: path[0],
          title: slugify(covertedBlog.pageTitle),
          imagealt: covertedBlog.imageQuery,
          imageurl: link,
          subsection: path[1],
          subsubsection: path[2],
          content: results,
          instructions: covertedBlog.instructions,
          recipedetails: covertedBlog.recipeDetails,
          recipedescription: covertedBlog.recipeDescription.shortDescription,
          author: covertedBlog.author,
          quote: covertedBlog.quote,
          seo: covertedBlog.seo,
          faq: covertedBlog.faq,
          equipments: covertedBlog.equipments,
          slug: `${path[0]}/${path[1]}/${path[2]}/${slugify(
            covertedBlog.pageTitle
          )}`,
        });
        if (res.status) {
          setConsoleData((prev) => [
            ...prev,
            `UPLOAD SUCCESSFULL, ${res.data}, STARTING NEXT CYCLE...`,
          ]);

          console.log("UPLOAD SUCCESSFULL", res.data, "STARTING NEXT CYCLE...");
          setSuccessCount((prev) => prev + 1);
          // console.clear(); // Clears the console
          startProcess(); // Continue the process if running
        } else {
          setConsoleData((prev) => [...prev, `UPLOAD FAILED, RETRYING...`]);

          console.error("UPLOAD FAILED, RETRYING...");
          setFailedCount((prev) => prev + 1);
          // console.clear(); // Clears the console
          startProcess(); // Retry if failed
        }
      }
    } catch (error) {
      setConsoleData((prev) => [...prev, `ERROR OCCURED, RETRYING...`]);
      console.error("ERROR OCCURED, RETRYING...", error);
      setFailedCount((prev) => prev + 1);
      // console.clear(); // Clears the console
      startProcess(); // Handle errors and retry
    }
  }

  const startRunning = () => {
    setIsRunning(true);
    startProcess(); // Start the process immediately when the button is clicked
  };

  // Stop the process
  const stopRunning = () => {
    setIsRunning(false);
  };

  useEffect(() => {
    // Cleanup when the component unmounts or stops
    return () => {
      setIsRunning(false);
    };
  }, []);

  return (
    <div className="w-7/12 flex flex-col mx-auto my-4 leading-[1.7rem] font-[330] text-black ">
      {/* <div>
        {updatedBlog.map((item, index) => (
          <div key={index} className="flex flex-col gap-5 pb-5">
            <h1 className="text-2xl font-bold">{item?.title}</h1>
            <h2 className="text-[#505050]">{item?.description}</h2>{" "}
            {item.url !== "null" && (
              <img className="h-96 object-cover" src={item.url} alt="" />
            )}
          </div>
        ))}
      </div> */}

      <div>
        <h1 className="bg-green-500">SUCCESS: {successCount}</h1>
        <h1 className="bg-red-500">FAILED: {failedCount}</h1>
        <button
          onClick={startRunning}
          disabled={isRunning}
          className={`${isRunning && "hidden"}`}
        >
          Start
        </button>
        <div className="mx-auto">
          {consoleData.map((item, i) => (
            <h1 key={i}>{item}</h1>
          ))}
        </div>
        {/* <button onClick={stopRunning} disabled={!isRunning}>
          Stop
        </button> */}
      </div>
    </div>
  );
}

export default Upload2;
