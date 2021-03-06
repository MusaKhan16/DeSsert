import { useState, useEffect } from "react";
import DesoConfig from "./DesoConfig";
import Deso from "deso-protocol";
import PostFilterString from "./PostFilterString";

const blacklistedRecipes = [
  "16c013aae79bda54764bb6f4d73751649b7f09b8bdb6c95553e97e55f2229385",
  "2cc54586062df0c221ebd202f575609b3cebdbdc1dc04f8e240802c0eafca792"
]

export const useUserRecipes = () => {
    const [userRecipes, setUserRecipes] = useState([]);

    useEffect(() => {
        (async () => {
            // Getting user's recipes
            const myDeso = new Deso(DesoConfig);

            if (!myDeso.identity.getUserKey()) {
                return;
            }

            try {
                const response = await myDeso.posts.getPostsForPublicKey({
                    PublicKeyBase58Check: myDeso.identity.getUserKey(),
                    ReaderPublicKeyBase58Check: myDeso.identity.getUserKey(),
                    NumToFetch: 100,
                });

                console.log("My Posts (raw)", response.Posts);

                const { Profile } = await myDeso.user.getSingleProfile({
                    PublicKeyBase58Check: myDeso.identity.getUserKey(),
                });

                let myPosts = [];

                response.Posts.filter(postObj => !blacklistedRecipes.includes(postObj.PostHashHex)).forEach((postObj) => {
                    let username = Profile.Username
                        ? Profile.Username
                        : postObj.PosterPublicKeyBase58Check.slice(0, 10);
                    let avatar = myDeso.user.getSingleProfilePicture(
                        postObj.PosterPublicKeyBase58Check
                    );

                    if (!postObj.Body.includes(PostFilterString)) {
                        // Not a recipe post
                        return;
                    }

                    myPosts.push({
                        name: postObj.PostExtraData.recipeName,
                        description: postObj.PostExtraData.recipeDescription,
                        content: postObj.Body.replace(
                            `${PostFilterString}--`,
                            ""
                        ),
                        thumbnail: postObj.ImageURLs && postObj.ImageURLs.at(0),
                        author: {
                            username: username,
                            avatar: avatar,
                        },
                        id: postObj.PostHashHex,
                        isNFT: postObj.IsNFT,
                        likes: postObj.LikeCount,
                    });
                });

                console.log(myPosts);

                setUserRecipes(myPosts);
            } catch (e) {
                // User probably hasn't posted anything yet or doesn't exist...
                console.error(e);
                return;
            }
        })();
    }, []);

    return [userRecipes, setUserRecipes];
};
