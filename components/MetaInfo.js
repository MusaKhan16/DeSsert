import Head from "next/head";

export default function MetaInfo({ name }) {
    console.log(name);
    return (
        <Head>
            <title>{name} | DeSsert</title>
        </Head>
    );
}
