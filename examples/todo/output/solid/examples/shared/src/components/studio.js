import { createMutable, Show, For } from "solid-js";
import { css } from "solid-styled-components";

export default function MyComponent() {
  const state = createMutable({});

  return (
    <Fragment>
      <div
        class={css({
          display: "flex",
          flexDirection: "column",
          position: "relative",
          marginTop: "0px",
          paddingLeft: "40px",
          paddingRight: "40px",
          paddingTop: "0px",
          paddingBottom: "0px",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          "@media (max-width: 640px)": {
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "px",
          },
        })}
      >
        <div
          class={css({
            width: "100%",
            alignSelf: "stretch",
            flexGrow: "1",
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            marginLeft: "auto",
            marginRight: "auto",
          })}
        >
          <div
            class={css({
              paddingTop: "0px",
              marginTop: "20px",
              position: "relative",
              width: "1400px",
              marginLeft: "auto",
              marginRight: "auto",
              "@media (max-width: 991px)": {
                maxWidth: "1883px",
                marginRight: "0px",
                marginLeft: "0px",
                width: "100%",
                paddingLeft: "20px",
                paddingRight: "20px",
              },
            })}
          >
            <div
              class={css({
                display: "flex",
                "@media (max-width: 999px)": {
                  flexDirection: "column",
                  alignItems: "stretch",
                },
              })}
            >
              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "normal",
                  width: "calc(50% - 10px)",
                  marginLeft: "0px",
                  "@media (max-width: 999px)": {
                    width: "100%",
                    marginLeft: 0,
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    marginTop: "auto",
                    marginBottom: "auto",
                    paddingLeft: "10px",
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      marginTop: "20px",
                      height: "auto",
                      width: "auto",
                      borderRadius: "30px",
                      background:
                        "linear-gradient(269.81deg, #45B7CF 0.17%, #207593 99.84%)",
                      alignSelf: "center",
                      flexGrow: "0",
                      paddingTop: "5px",
                      paddingBottom: "5px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      marginRight: "auto",
                      "@media (max-width: 991px)": {
                        paddingTop: "px",
                      },
                      "@media (max-width: 640px)": {
                        width: "auto",
                        height: "auto",
                        marginTop: "0px",
                        alignSelf: "center",
                        flexGrow: "0",
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "auto",
                        lineHeight: "normal",
                        height: "auto",
                        textAlign: "left",
                        color: "rgba(244, 243, 233, 1)",
                        fontSize: "14px",
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginBottom: "auto",
                        letterSpacing: ".18em",
                        fontFamily: "Basic Sans, sans-serif",
                        "@media (max-width: 991px)": {
                          textAlign: "center",
                        },
                        "@media (max-width: 640px)": {
                          fontSize: "12px",
                          textAlign: "left",
                        },
                      })}
                    >
                      <p>THEME STUDIO</p>
                    </div>
                  </div>

                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      marginTop: "20px",
                      paddingLeft: "0px",
                      marginRight: "0px",
                      "@media (max-width: 991px)": {
                        marginTop: "20px",
                        paddingLeft: "0px",
                        marginRight: "-0.12px",
                      },
                      "@media (max-width: 640px)": {
                        marginTop: "0px",
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        lineHeight: "normal",
                        height: "auto",
                        textAlign: "left",
                        color: "rgba(14, 32, 26, 1)",
                        fontSize: "56px",
                        fontWeight: "400",
                        marginRight: "auto",
                        letterSpacing: "-0.03em",
                        fontFamily: "basic-sans, sans-serif",
                        "@media (max-width: 991px)": {
                          fontSize: "30px",
                          textAlign: "left",
                          marginTop: "20px",
                          width: "auto",
                          alignSelf: "left",
                          marginRight: "0px",
                          marginLeft: "0px",
                        },
                        "@media (max-width: 640px)": {
                          fontSize: "27px",
                          marginTop: "20px",
                          width: "100%",
                          alignSelf: "stretch",
                          paddingRight: "0px",
                        },
                      })}
                    >
                      <p>Create no-code Shopify magic</p>
                    </div>

                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "37px",
                        height: "auto",
                        textAlign: "left",
                        color: "rgba(14, 22, 36, 0.6)",
                        fontSize: "18px",
                        fontWeight: "400",
                        paddingLeft: "0px",
                        paddingBottom: "0px",
                        paddingRight: "0px",
                        width: "100%",
                        alignSelf: "stretch",
                        maxWidth: "780px",
                        marginLeft: "0px",
                        marginRight: "0px",
                        lineHeight: "32px",
                        fontFamily: "basic-sans, sans-serif",
                        "@media (max-width: 991px)": {
                          textAlign: "left",
                          maxHeight: "none",
                          marginLeft: "auto",
                          marginRight: "auto",
                          marginTop: "20px",
                        },
                        "@media (max-width: 640px)": {
                          fontSize: "17px",
                          width: "auto",
                          alignSelf: "stretch",
                          marginTop: "30px",
                        },
                      })}
                    >
                      <p>
                        Builder Visual CMS
                        <strong> </strong>
                        is the first and only headless CMS with a powerful
                        drag-and-drop visual editor that lets you build and
                        optimize digital experiences with speed and flexibility
                      </p>
                    </div>
                  </div>

                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "row",
                      position: "relative",
                      marginTop: "20px",
                      paddingBottom: "0px",
                      width: "auto",
                      alignSelf: "center",
                      marginRight: "auto",
                      "@media (max-width: 640px)": {
                        marginTop: "30px",
                        width: "100%",
                        alignItems: "center",
                      },
                    })}
                  >
                    <a
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        height: "auto",
                        borderRadius: "100px",
                        backgroundImage:
                          "linear-gradient(to right, #E07748 , #BD3827 , #45B7CF , #207593)",
                        width: "auto",
                        cursor: "pointer",
                        pointerEvents: "auto",
                        marginRight: "20px",
                        flexGrow: "0",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        alignSelf: "center",
                        "@media (max-width: 640px)": {
                          marginRight: "auto",
                          width: "auto",
                          flexGrow: "0",
                        },
                      })}
                      href="https://apps.shopify.com/builder-2"
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          appearance: "none",
                          paddingTop: "15px",
                          paddingBottom: "15px",
                          paddingLeft: "45px",
                          paddingRight: "45px",
                          color: "white",
                          borderRadius: "50px",
                          textAlign: "center",
                          cursor: "pointer",
                          height: "auto",
                          marginLeft: "auto",
                          marginRight: "auto",
                          backgroundImage:
                            "linear-gradient(to right , #1e231c , #364b34)",
                          fontSize: "24px",
                          lineHeight: "29px",
                          fontFamily: "basic-sans, sans-serif",
                          flexGrow: "0",
                          "@media (max-width: 640px)": {
                            fontSize: "16px",
                            paddingTop: "10px",
                            paddingLeft: "15px",
                            paddingRight: "15px",
                            paddingBottom: "10px",
                          },
                        })}
                      >
                        <a href="" target="_self">
                          Try for free
                        </a>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "normal",
                  width: "calc(50% - 10px)",
                  marginLeft: "20px",
                  "@media (max-width: 999px)": {
                    width: "100%",
                    marginLeft: 0,
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    minHeight: "560px",
                    marginTop: "auto",
                    marginBottom: "auto",
                    paddingRight: "25px",
                    marginLeft: "20px",
                    "@media (max-width: 991px)": {
                      paddingRight: "0px",
                      alignItems: "center",
                      paddingBottom: "0px",
                      marginTop: "40px",
                      minHeight: "200px",
                      marginLeft: "0px",
                    },
                    "@media (max-width: 640px)": {
                      justifyContent: "flex-start",
                      marginLeft: "0px",
                      marginTop: "10px",
                      paddingTop: "55px",
                    },
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      minWidth: "20px",
                      overflow: "hidden",
                      paddingBottom: "0px",
                      "@media (max-width: 991px)": {
                        marginTop: "0px",
                        height: "auto",
                        paddingBottom: "0px",
                        flexGrow: "0",
                        width: "100%",
                      },
                      "@media (max-width: 640px)": {
                        height: "auto",
                        marginTop: "20px",
                        flexGrow: "0",
                      },
                    })}
                  >
                    <div
                      class={css({
                        position: "relative",
                      })}
                    >
                      <picture>
                        <source
                          srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=1355 1355w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=558 558w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?format=webp&width=762 762w"
                          type="image/webp"
                        />

                        <img
                          class={css({
                            objectFit: "contain",
                            objectPosition: "center",
                            position: "absolute",
                            height: "100%",
                            width: "100%",
                            top: "0",
                            left: "0",
                          })}
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=1355"
                          sizes="(max-width: 638px) 88vw, 55vw"
                          srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=1355 1355w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=558 558w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F003add813b3149e9b56c17c2843cebde?width=762 762w"
                        />
                      </picture>

                      <div
                        class={css({
                          width: "100%",
                          paddingTop: "72.32%",
                          pointerEvents: "none",
                          fontSize: "0",
                        })}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class={css({
          display: "flex",
          flexDirection: "column",
          position: "relative",
          marginTop: "-1px",
          height: "auto",
          paddingBottom: "30px",
          paddingTop: "30px",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          backgroundColor: "rgba(244, 243, 233, 1)",
          "@media (max-width: 991px)": {
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "30px",
            contentVisibility: "auto",
            containIntrinsicSize: "274px",
          },
          "@media (max-width: 640px)": {
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "0px",
          },
        })}
      >
        <div
          class={css({
            display: "flex",
            flexDirection: "column",
            position: "relative",
            marginTop: "20px",
            lineHeight: "38px",
            height: "auto",
            textAlign: "center",
            fontWeight: "400",
            fontSize: "32px",
            width: "70%",
            marginLeft: "auto",
            marginRight: "auto",
            fontFamily: "Basic Sans, sans-serif",
            color: "rgba(14, 32, 26, 1)",
            "@media (max-width: 991px)": {
              width: "100%",
              fontSize: "30px",
            },
            "@media (max-width: 640px)": {
              fontSize: "24px",
              paddingLeft: "0px",
              paddingRight: "0px",
              marginTop: "0px",
            },
          })}
        >
          <p>
            Build the e-commerce store of your dreams. No code, no stress, no
            limits.
          </p>
        </div>

        <div
          class={css({
            display: "flex",
            flexDirection: "column",
            position: "relative",
            marginTop: "3px",
            paddingBottom: "24px",
            marginLeft: "auto",
            marginRight: "auto",
            width: "50%",
            "@media (max-width: 991px)": {
              width: "100%",
            },
            "@media (max-width: 640px)": {
              width: "100%",
              contentVisibility: "auto",
              containIntrinsicSize: "279px",
            },
          })}
        >
          <div
            class={css({
              display: "flex",
              "@media (max-width: 639px)": {
                flexDirection: "column",
                alignItems: "stretch",
              },
            })}
          >
            <div
              class={css({
                display: "flex",
                flexDirection: "column",
                lineHeight: "normal",
                width: "calc(33.333333333333336% - 13.333333333333334px)",
                marginLeft: "0px",
                "@media (max-width: 639px)": {
                  width: "100%",
                  marginLeft: 0,
                },
              })}
            >
              <div
                class={css({
                  display: "flex",
                  flexDirection: "row",
                  position: "relative",
                  marginTop: "20px",
                  paddingBottom: "30px",
                  alignItems: "center",
                  justifyContent: "center",
                  "@media (max-width: 640px)": {
                    width: "100%",
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  })}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        "<svg  width=&quot;30&quot;  height=&quot;30&quot;  viewBox=&quot;0 0 25 24&quot;  fill=&quot;none&quot;  xmlns=&quot;http://www.w3.org/2000/svg&quot; >  <path  fill-rule=&quot;evenodd&quot;  clip-rule=&quot;evenodd&quot;  d=&quot;M1.25 12C1.25 5.7868 6.2868 0.75 12.5 0.75C18.7132 0.75 23.75 5.7868 23.75 12C23.75 18.2132 18.7132 23.25 12.5 23.25C6.2868 23.25 1.25 18.2132 1.25 12ZM21.25 12C21.25 7.16751 17.3325 3.25 12.5 3.25C7.66751 3.25 3.75 7.16751 3.75 12C3.75 16.8325 7.66751 20.75 12.5 20.75C17.3325 20.75 21.25 16.8325 21.25 12Z&quot;  fill=&quot;#E07748&quot;  />  <path  d=&quot;M12.5 5.75C13.1472 5.75 13.6795 6.24187 13.7435 6.87219L13.75 7V11.483L16.3839 14.1161C16.8395 14.5717 16.8699 15.2915 16.475 15.7824L16.3839 15.8839C15.9283 16.3395 15.2085 16.3699 14.7176 15.975L14.6161 15.8839L11.6161 12.8839C11.4152 12.683 11.2897 12.4207 11.258 12.141L11.25 12V7C11.25 6.30964 11.8096 5.75 12.5 5.75Z&quot;  fill=&quot;#E07748&quot;  /> </svg> ",
                    }}
                  ></div>
                </div>

                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    marginLeft: "20px",
                    lineHeight: "normal",
                    height: "auto",
                    textAlign: "center",
                    color: "rgba(224, 119, 72, 1)",
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "basic-sans, sans-serif",
                    "@media (max-width: 640px)": {
                      marginLeft: "10px",
                    },
                  })}
                >
                  <p>SPEND LESS</p>
                </div>
              </div>
            </div>

            <div
              class={css({
                display: "flex",
                flexDirection: "column",
                lineHeight: "normal",
                width: "calc(33.333333333333336% - 13.333333333333334px)",
                marginLeft: "20px",
                "@media (max-width: 639px)": {
                  width: "100%",
                  marginLeft: 0,
                },
              })}
            >
              <div
                class={css({
                  display: "flex",
                  flexDirection: "row",
                  position: "relative",
                  marginTop: "20px",
                  paddingBottom: "30px",
                  alignItems: "center",
                  justifyContent: "center",
                  "@media (max-width: 640px)": {
                    width: "100%",
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  })}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        "<svg  width=&quot;30&quot;  height=&quot;30&quot;  viewBox=&quot;0 0 25 24&quot;  fill=&quot;none&quot;  xmlns=&quot;http://www.w3.org/2000/svg&quot; >  <path  fill-rule=&quot;evenodd&quot;  clip-rule=&quot;evenodd&quot;  d=&quot;M11.25 21V3.00001C11.25 1.9178 12.5318 1.34693 13.3362 2.07089L23.3362 11.0709C23.8879 11.5674 23.8879 12.4326 23.3362 12.9291L13.3362 21.9291C12.5318 22.6531 11.25 22.0822 11.25 21ZM20.63 12L13.75 5.80701V18.192L20.63 12Z&quot;  fill=&quot;#45B7CF&quot;  />  <path  fill-rule=&quot;evenodd&quot;  clip-rule=&quot;evenodd&quot;  d=&quot;M1.25 21V3.00001C1.25 1.9178 2.5318 1.34693 3.33621 2.07089L13.3362 11.0709C13.8879 11.5674 13.8879 12.4326 13.3362 12.9291L3.33621 21.9291C2.5318 22.6531 1.25 22.0822 1.25 21ZM10.63 12L3.75 5.80701V18.192L10.63 12Z&quot;  fill=&quot;#45B7CF&quot;  /> </svg> ",
                    }}
                  ></div>
                </div>

                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    marginLeft: "20px",
                    lineHeight: "normal",
                    height: "auto",
                    textAlign: "center",
                    color: "rgba(69, 183, 207, 1)",
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "basic-sans, sans-serif",
                    "@media (max-width: 640px)": {
                      marginLeft: "10px",
                    },
                  })}
                >
                  <p>MOVE FASTER</p>
                </div>
              </div>
            </div>

            <div
              class={css({
                display: "flex",
                flexDirection: "column",
                lineHeight: "normal",
                width: "calc(33.333333333333336% - 13.333333333333334px)",
                marginLeft: "20px",
                "@media (max-width: 639px)": {
                  width: "100%",
                  marginLeft: 0,
                },
              })}
            >
              <div
                class={css({
                  display: "flex",
                  flexDirection: "row",
                  position: "relative",
                  marginTop: "20px",
                  paddingBottom: "30px",
                  alignItems: "center",
                  justifyContent: "center",
                  "@media (max-width: 640px)": {
                    width: "100%",
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  })}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        "<svg  width=&quot;30&quot;  height=&quot;30&quot;  viewBox=&quot;0 0 25 20&quot;  fill=&quot;none&quot;  xmlns=&quot;http://www.w3.org/2000/svg&quot; >  <path  d=&quot;M16.3069 1.62716C16.6604 0.495852 18.2167 0.461155 18.6507 1.50978L18.6973 1.64082L21.43 10.75H23C23.6472 10.75 24.1795 11.2419 24.2435 11.8722L24.25 12C24.25 12.6472 23.7581 13.1795 23.1278 13.2435L23 13.25H20.5C19.9905 13.25 19.5366 12.9415 19.345 12.4782L19.3027 12.3592L17.475 6.269L13.6931 18.3728C13.3589 19.4424 11.9174 19.5509 11.4053 18.6047L11.3462 18.4809L7.396 9.004L5.61785 12.5594C5.42721 12.9403 5.05765 13.195 4.6406 13.2421L4.5 13.25H2C1.30964 13.25 0.75 12.6904 0.75 12C0.75 11.3528 1.24187 10.8205 1.87219 10.7565L2 10.75H3.727L6.38215 5.44565C6.84011 4.5305 8.12375 4.53436 8.59474 5.40063L8.65377 5.5241L12.331 14.347L16.3069 1.62716Z&quot;  fill=&quot;#365C42&quot;  /> </svg> ",
                    }}
                  ></div>
                </div>

                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    marginLeft: "20px",
                    lineHeight: "normal",
                    height: "auto",
                    textAlign: "center",
                    color: "rgba(54, 92, 66, 1)",
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "basic-sans, sans-serif",
                    "@media (max-width: 640px)": {
                      marginLeft: "10px",
                    },
                  })}
                >
                  <p>DO MORE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class={css({
          display: "flex",
          flexDirection: "column",
          position: "relative",
          marginTop: "0px",
          paddingLeft: "40px",
          paddingRight: "40px",
          paddingTop: "0px",
          paddingBottom: "0px",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          "@media (max-width: 640px)": {
            paddingLeft: "20px",
            paddingRight: "20px",
          },
        })}
      >
        <div
          class={css({
            width: "100%",
            alignSelf: "stretch",
            flexGrow: "1",
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            marginLeft: "auto",
            marginRight: "auto",
          })}
        >
          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "0px",
              width: "auto",
              paddingBottom: "30px",
              alignSelf: "center",
              marginBottom: "0px",
              maxWidth: "1400px",
              paddingTop: "30px",
              height: "auto",
              flexGrow: "0",
              "@media (max-width: 991px)": {
                paddingBottom: "30px",
                marginTop: "0px",
                marginBottom: "0px",
                paddingTop: "0px",
                paddingLeft: "20px",
                paddingRight: "20px",
              },
              "@media (max-width: 640px)": {
                paddingBottom: "0px",
                width: "100%",
                alignSelf: "stretch",
              },
            })}
          >
            <div
              class={css({
                display: "flex",
                "@media (max-width: 999px)": {
                  flexDirection: "column",
                  alignItems: "stretch",
                },
              })}
            >
              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "normal",
                  width: "calc(50% - 10px)",
                  marginLeft: "0px",
                  "@media (max-width: 999px)": {
                    width: "100%",
                    marginLeft: 0,
                  },
                })}
              >
                <div
                  class={css({
                    display: "none",
                    flexDirection: "column",
                    position: "relative",
                    marginTop: "-0.5px",
                    lineHeight: "normal",
                    height: "auto",
                    textAlign: "left",
                    fontSize: "40px",
                    fontWeight: "600",
                    marginRight: "auto",
                    zIndex: "5",
                    backgroundImage:
                      "linear-gradient(180deg, white 60%, #d3d3d3 40%)",
                    paddingLeft: "0px",
                    marginLeft: "100px",
                    "@media (max-width: 991px)": {
                      marginLeft: "auto",
                      marginRight: "auto",
                    },
                    "@media (max-width: 640px)": {
                      marginTop: "23px",
                      fontSize: "36px",
                      marginRight: "auto",
                      textAlign: "left",
                      marginLeft: "auto",
                    },
                  })}
                >
                  <p>How</p>
                </div>

                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    marginTop: "auto",
                    height: "auto",
                    paddingBottom: "0px",
                    width: "auto",
                    zIndex: "1",
                    alignSelf: "center",
                    flexGrow: "0",
                    marginBottom: "auto",
                    "@media (max-width: 991px)": {
                      marginLeft: "0px",
                      height: "auto",
                      flexGrow: "0",
                      zIndex: "15",
                      paddingLeft: "0px",
                      marginTop: "0px",
                      paddingTop: "60px",
                    },
                    "@media (max-width: 640px)": {
                      paddingBottom: "0px",
                      paddingLeft: "0px",
                      paddingTop: "0px",
                    },
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      marginTop: "20px",
                      height: "auto",
                      width: "auto",
                      borderRadius: "30px",
                      background:
                        "linear-gradient(270deg, #365C42 0%, #0E201A 100%)",
                      alignSelf: "center",
                      flexGrow: "0",
                      paddingTop: "5px",
                      paddingBottom: "5px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      marginRight: "auto",
                      "@media (max-width: 991px)": {
                        paddingTop: "px",
                      },
                      "@media (max-width: 640px)": {
                        width: "auto",
                        height: "auto",
                        marginTop: "20px",
                        alignSelf: "center",
                        flexGrow: "0",
                        paddingTop: "px",
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "auto",
                        lineHeight: "normal",
                        height: "auto",
                        textAlign: "left",
                        color: "rgba(244, 243, 233, 1)",
                        fontSize: "14px",
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginBottom: "auto",
                        letterSpacing: ".18em",
                        fontFamily: "Basic Sans, sans-serif",
                        "@media (max-width: 991px)": {
                          textAlign: "center",
                        },
                        "@media (max-width: 640px)": {
                          fontSize: "12px",
                          textAlign: "left",
                        },
                      })}
                    >
                      <p>BUILD</p>
                    </div>
                  </div>

                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      textAlign: "left",
                      lineHeight: "54px",
                      height: "auto",
                      fontWeight: "400",
                      fontSize: "54px",
                      paddingLeft: "0px",
                      width: "100%",
                      marginTop: "10px",
                      fontFamily: "Basic Sans, sans-serif",
                      color: "rgba(14, 32, 26, 1)",
                      letterSpacing: "-0.03em",
                      "@media (max-width: 991px)": {
                        textAlign: "left",
                        fontSize: "55px",
                        display: "flex",
                      },
                      "@media (max-width: 640px)": {
                        fontSize: "32px",
                        display: "flex",
                      },
                    })}
                  >
                    <p>Make it exactly as you want it</p>
                  </div>

                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      marginTop: "10px",
                      textAlign: "left",
                      lineHeight: "1.5em",
                      fontWeight: "400",
                      fontSize: "18px",
                      width: "90%",
                      marginBottom: "auto",
                      zIndex: "13",
                      color: "rgba(14, 32, 26, 0.6)",
                      fontFamily: "Avenir, sans-serif",
                      "@media (max-width: 991px)": {
                        width: "90%",
                        marginRight: "auto",
                        fontSize: "18px",
                      },
                      "@media (max-width: 640px)": {
                        fontSize: "16px",
                        marginBottom: "0",
                        width: "100%",
                        marginTop: "20px",
                      },
                    })}
                  >
                    <p>
                      This isn't just another page builder. Our powerful visual
                      editor lets you drag-and-drop to create and customize
                      anything, from header to footer. Start with our templates,
                      import your current pages, or start from scratch to
                      quickly bring your vision to life. (And remember, no
                      developer required!)
                    </p>
                  </div>
                </div>
              </div>

              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "normal",
                  width: "calc(50% - 10px)",
                  marginLeft: "20px",
                  "@media (max-width: 999px)": {
                    width: "100%",
                    marginLeft: 0,
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    marginTop: "-61px",
                    minHeight: "20px",
                    minWidth: "20px",
                    overflow: "hidden",
                    zIndex: "2",
                    marginBottom: "-90px",
                    marginLeft: "-70px",
                    marginRight: "-40px",
                    "@media (max-width: 991px)": {
                      width: "100%",
                      height: "auto",
                      zIndex: "5",
                      display: "flex",
                      paddingBottom: "0px",
                      marginTop: "0px",
                      marginLeft: "auto",
                      flexGrow: "1",
                      marginRight: "auto",
                    },
                    "@media (max-width: 640px)": {
                      width: "100%",
                      position: "relative",
                      paddingBottom: "0px",
                      display: "flex",
                      marginBottom: "0px",
                    },
                  })}
                >
                  <div
                    class={css({
                      position: "relative",
                    })}
                  >
                    <picture>
                      <source
                        srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=1020 1020w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=558 558w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?format=webp&width=917 917w"
                        type="image/webp"
                      />

                      <img
                        class={css({
                          objectFit: "contain",
                          objectPosition: "center",
                          position: "absolute",
                          height: "100%",
                          width: "100%",
                          top: "0",
                          left: "0",
                        })}
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=1020"
                        sizes="(max-width: 638px) 88vw, 66vw"
                        srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=1020 1020w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=558 558w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7d626c4de12b4ca4a80e191551b60c44?width=917 917w"
                      />
                    </picture>

                    <div
                      class={css({
                        width: "100%",
                        paddingTop: "70.16%",
                        pointerEvents: "none",
                        fontSize: "0",
                      })}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class={css({
          display: "flex",
          flexDirection: "column",
          position: "relative",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "0px",
          paddingBottom: "0px",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          backgroundColor: "rgba(244, 243, 233, 1)",
          fontSize: "18px",
          color: "rgba(14, 32, 26, 1)",
          contentVisibility: "auto",
          containIntrinsicSize: "9775px",
          "@media (max-width: 991px)": {
            paddingTop: "0px",
            contentVisibility: "auto",
            containIntrinsicSize: "13700px",
          },
          "@media (max-width: 640px)": {
            contentVisibility: "auto",
            containIntrinsicSize: "10919px",
          },
        })}
      >
        <div
          class={css({
            width: "100%",
            alignSelf: "stretch",
            flexGrow: "1",
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            marginLeft: "auto",
            marginRight: "auto",
          })}
        >
          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              lineHeight: "normal",
              height: "auto",
              textAlign: "center",
              color: "rgba(14, 32, 26, 1)",
              marginBottom: "auto",
              fontSize: "72px",
              fontFamily: "Basic Sans, sans-serif",
              paddingTop: "60px",
              paddingBottom: "30px",
              "@media (max-width: 991px)": {
                fontSize: "44px",
                paddingTop: "30px",
              },
              "@media (max-width: 640px)": {
                fontSize: "18px",
                width: "100%",
                marginBottom: "auto",
                marginTop: "25px",
              },
            })}
          >
            <p>Endless customization, endless possibilities</p>
          </div>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "0px",
              paddingLeft: "40px",
              paddingRight: "40px",
              paddingTop: "0px",
              paddingBottom: "0px",
              width: "100vw",
              marginLeft: "calc(50% - 50vw)",
              "@media (max-width: 640px)": {
                paddingLeft: "20px",
                paddingRight: "20px",
              },
            })}
          >
            <div
              class={css({
                width: "100%",
                alignSelf: "stretch",
                flexGrow: "1",
                maxWidth: "1200px",
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
                marginRight: "auto",
              })}
            >
              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  width: "100%",
                  alignSelf: "center",
                  maxWidth: "1400px",
                  paddingTop: "30px",
                  paddingBottom: "30px",
                  "@media (max-width: 991px)": {
                    marginTop: "0px",
                    paddingTop: "30px",
                    paddingBottom: "30px",
                    width: "100%",
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    "@media (max-width: 999px)": {
                      flexDirection: "column",
                      alignItems: "stretch",
                    },
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "0px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "auto",
                        height: "auto",
                        paddingBottom: "30px",
                        marginBottom: "auto",
                        "@media (max-width: 991px)": {
                          marginLeft: "0px",
                          paddingLeft: "0px",
                        },
                        "@media (max-width: 640px)": {
                          marginTop: "0px",
                          paddingLeft: "0px",
                        },
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "60px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "54px",
                          fontWeight: "400",
                          fontFamily: "Basic Sans, sans-serif",
                          letterSpacing: "-0.03em",
                          width: "100%",
                          paddingRight: "10px",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "0px",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "32px",
                            marginTop: "0px",
                            paddingRight: "0px",
                          },
                        })}
                      >
                        <p>Getting started is easy</p>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "30px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "18px",
                          fontWeight: "400",
                          width: "70%",
                          alignSelf: "center",
                          marginRight: "auto",
                          color: "rgba(14, 32, 26, 0.6)",
                          fontFamily: "Avenir, sans-serif",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "20px",
                            width: "100%",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "16px",
                            width: "100%",
                          },
                        })}
                      >
                        <p>
                          Get started with our templates, import your own, or
                          start from scratch.
                        </p>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "row",
                          position: "relative",
                          marginTop: "20px",
                          paddingBottom: "30px",
                          "@media (max-width: 991px)": {
                            alignItems: "center",
                          },
                          "@media (max-width: 640px)": {
                            paddingBottom: "0px",
                          },
                        })}
                      >
                        <div
                          class={css({
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            lineHeight: "normal",
                            height: "auto",
                            textAlign: "center",
                            fontSize: "32px",
                            color: "rgba(224, 119, 72, 1)",
                            fontFamily: "basic-sans, sans-serif",
                            cursor: "pointer",
                            pointerEvents: "auto",
                            "@media (max-width: 991px)": {
                              fontSize: "24px",
                              marginTop: "auto",
                              marginBottom: "auto",
                            },
                            "@media (max-width: 640px)": {
                              fontSize: "16px",
                            },
                          })}
                          href="https://apps.shopify.com/builder-2"
                        >
                          <p>Start Building</p>
                        </div>

                        <div
                          class={css({
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            marginLeft: "20px",
                            width: "36px",
                            minHeight: "20px",
                            minWidth: "20px",
                            overflow: "hidden",
                            height: "46px",
                            marginTop: "auto",
                            marginBottom: "auto",
                            "@media (max-width: 991px)": {
                              width: "30px",
                              height: "30px",
                            },
                            "@media (max-width: 640px)": {
                              width: "24px",
                              height: "24px",
                              marginLeft: "10px",
                            },
                          })}
                        >
                          <div
                            class={css({
                              position: "relative",
                            })}
                          >
                            <picture>
                              <source
                                srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?format=webp&width=36 36w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?format=webp&width=24 24w"
                                type="image/webp"
                              />

                              <img
                                class={css({
                                  objectFit: "contain",
                                  objectPosition: "center",
                                  position: "absolute",
                                  height: "100%",
                                  width: "100%",
                                  top: "0",
                                  left: "0",
                                })}
                                loading="lazy"
                                src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=36"
                                sizes="4vw"
                                srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=36 36w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4d4d8dd8ab274d28b694cbb3e802f3d8?width=24 24w"
                              />
                            </picture>

                            <div
                              class={css({
                                width: "100%",
                                paddingTop: "120%",
                                pointerEvents: "none",
                                fontSize: "0",
                              })}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "20px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "0px",
                        minHeight: "20px",
                        minWidth: "20px",
                        overflow: "hidden",
                        "@media (max-width: 991px)": {
                          marginTop: "0px",
                        },
                      })}
                    >
                      <div
                        class={css({
                          position: "relative",
                        })}
                      >
                        <picture>
                          <source
                            srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?format=webp&width=817 817w"
                            type="image/webp"
                          />

                          <img
                            class={css({
                              objectFit: "contain",
                              objectPosition: "center",
                              position: "absolute",
                              height: "100%",
                              width: "100%",
                              top: "0",
                              left: "0",
                            })}
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=918"
                            sizes="(max-width: 638px) 94vw, 59vw"
                            srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fff632f82f24249678e1c4ad44ba2fd71?width=817 817w"
                          />
                        </picture>

                        <div
                          class={css({
                            width: "100%",
                            paddingTop: "80.16%",
                            pointerEvents: "none",
                            fontSize: "0",
                          })}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  marginTop: "0px",
                  paddingLeft: "40px",
                  paddingRight: "40px",
                  paddingTop: "0px",
                  paddingBottom: "0px",
                  width: "100vw",
                  marginLeft: "calc(50% - 50vw)",
                })}
              >
                <div
                  class={css({
                    width: "100%",
                    alignSelf: "stretch",
                    flexGrow: "1",
                    maxWidth: "1200px",
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: "auto",
                    marginRight: "auto",
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      width: "100%",
                      paddingBottom: "30px",
                      marginTop: "px",
                      alignSelf: "center",
                      maxWidth: "1400px",
                      marginLeft: "px",
                      paddingTop: "30px",
                      "@media (max-width: 991px)": {
                        paddingBottom: "30px",
                        marginTop: "0px",
                        paddingTop: "30px",
                        width: "100%",
                      },
                      "@media (max-width: 640px)": {
                        marginTop: "0px",
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        "@media (max-width: 999px)": {
                          flexDirection: "column",
                          alignItems: "stretch",
                        },
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          lineHeight: "normal",
                          width: "calc(50% - 10px)",
                          marginLeft: "0px",
                          "@media (max-width: 999px)": {
                            width: "100%",
                            marginLeft: 0,
                          },
                        })}
                      >
                        <div
                          class={css({
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            marginTop: "30px",
                            textAlign: "center",
                            lineHeight: "normal",
                            height: "auto",
                            minHeight: "20px",
                            minWidth: "20px",
                            overflow: "hidden",
                            "@media (max-width: 991px)": {
                              marginTop: "0px",
                            },
                            "@media (max-width: 640px)": {
                              marginTop: "0px",
                            },
                          })}
                        >
                          <div
                            class={css({
                              position: "relative",
                            })}
                          >
                            <picture>
                              <source
                                srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=558 558w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?format=webp&width=675 675w"
                                type="image/webp"
                              />

                              <img
                                class={css({
                                  objectFit: "contain",
                                  objectPosition: "top",
                                  position: "absolute",
                                  height: "100%",
                                  width: "100%",
                                  top: "0",
                                  left: "0",
                                })}
                                loading="lazy"
                                src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=918"
                                sizes="(max-width: 638px) 88vw, 49vw"
                                srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=558 558w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa5d8ab04b724171bf54fdc7018b3ea5?width=675 675w"
                              />
                            </picture>

                            <div
                              class={css({
                                width: "100%",
                                paddingTop: "80.16%",
                                pointerEvents: "none",
                                fontSize: "0",
                              })}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          lineHeight: "normal",
                          width: "calc(50% - 10px)",
                          marginLeft: "20px",
                          "@media (max-width: 999px)": {
                            width: "100%",
                            marginLeft: 0,
                          },
                        })}
                      >
                        <div
                          class={css({
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            marginTop: "auto",
                            height: "auto",
                            paddingBottom: "30px",
                            marginBottom: "auto",
                            width: "90%",
                            "@media (max-width: 991px)": {
                              marginTop: "0px",
                              paddingLeft: "0px",
                              paddingBottom: "0px",
                            },
                            "@media (max-width: 640px)": {
                              paddingLeft: "0px",
                              paddingBottom: "0px",
                              width: "100%",
                            },
                          })}
                        >
                          <div
                            class={css({
                              display: "flex",
                              flexDirection: "column",
                              position: "relative",
                              marginTop: "60px",
                              textAlign: "left",
                              lineHeight: "normal",
                              height: "auto",
                              fontSize: "54px",
                              fontWeight: "400",
                              fontFamily: "Basic Sans, sans-serif",
                              letterSpacing: "-0.03em",
                              width: "100%",
                              "@media (max-width: 991px)": {
                                marginRight: "auto",
                                marginTop: "20px",
                              },
                              "@media (max-width: 640px)": {
                                fontSize: "32px",
                              },
                            })}
                          >
                            <p>All the building blocks you need</p>
                          </div>

                          <div
                            class={css({
                              display: "flex",
                              flexDirection: "column",
                              position: "relative",
                              marginTop: "30px",
                              textAlign: "left",
                              lineHeight: "normal",
                              height: "auto",
                              fontSize: "18px",
                              fontWeight: "400",
                              width: "70%",
                              alignSelf: "center",
                              marginRight: "auto",
                              color: "rgba(14, 32, 26, 0.6)",
                              fontFamily: "Avenir, sans-serif",
                              "@media (max-width: 991px)": {
                                marginRight: "auto",
                                marginTop: "20px",
                                width: "100%",
                              },
                              "@media (max-width: 640px)": {
                                fontSize: "16px",
                                width: "100%",
                              },
                            })}
                          >
                            <p>
                              Drag-and-drop it all, from text, images, and
                              videos to products, collections, and add-to-carts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "0px",
              paddingLeft: "40px",
              paddingRight: "40px",
              paddingTop: "0px",
              paddingBottom: "0px",
              width: "100vw",
              marginLeft: "calc(50% - 50vw)",
              "@media (max-width: 640px)": {
                paddingLeft: "20px",
                paddingRight: "20px",
              },
            })}
          >
            <div
              class={css({
                width: "100%",
                alignSelf: "stretch",
                flexGrow: "1",
                maxWidth: "1200px",
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
                marginRight: "auto",
              })}
            >
              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  width: "100%",
                  alignSelf: "center",
                  maxWidth: "1400px",
                  paddingTop: "30px",
                  paddingBottom: "30px",
                  "@media (max-width: 991px)": {
                    marginTop: "0px",
                    paddingTop: "30px",
                    paddingBottom: "30px",
                    width: "100%",
                  },
                  "@media (max-width: 640px)": {
                    marginTop: "0px",
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    "@media (max-width: 999px)": {
                      flexDirection: "column",
                      alignItems: "stretch",
                    },
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "0px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "auto",
                        height: "auto",
                        paddingBottom: "30px",
                        marginLeft: "0px",
                        marginBottom: "auto",
                        "@media (max-width: 991px)": {
                          marginLeft: "0px",
                          paddingLeft: "0px",
                        },
                        "@media (max-width: 640px)": {
                          marginTop: "20px",
                          paddingLeft: "0px",
                        },
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "60px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "54px",
                          fontWeight: "400",
                          fontFamily: "Basic Sans, sans-serif",
                          letterSpacing: "-0.03em",
                          marginRight: "auto",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "0px",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "32px",
                            marginTop: "0px",
                            width: "100%",
                          },
                        })}
                      >
                        <p>Make it your own</p>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "30px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "18px",
                          fontWeight: "400",
                          alignSelf: "center",
                          marginRight: "auto",
                          color: "rgba(14, 32, 26, 0.6)",
                          fontFamily: "Avenir, sans-serif",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "20px",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "16px",
                            width: "100%",
                          },
                        })}
                      >
                        <p>
                          Completely customize the look and feel of your content
                          and make it come alive with animations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "20px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "20px",
                        minHeight: "20px",
                        minWidth: "20px",
                        overflow: "hidden",
                        "@media (max-width: 991px)": {
                          marginTop: "0px",
                        },
                      })}
                    >
                      <div
                        class={css({
                          position: "relative",
                        })}
                      >
                        <picture>
                          <source
                            srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?format=webp&width=817 817w"
                            type="image/webp"
                          />

                          <img
                            class={css({
                              objectFit: "contain",
                              objectPosition: "center",
                              position: "absolute",
                              height: "100%",
                              width: "100%",
                              top: "0",
                              left: "0",
                            })}
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=918"
                            sizes="(max-width: 638px) 94vw, 59vw"
                            srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30c350c0c9fe4578aa7ade21796aa1b8?width=817 817w"
                          />
                        </picture>

                        <div
                          class={css({
                            width: "100%",
                            paddingTop: "80.16%",
                            pointerEvents: "none",
                            fontSize: "0",
                          })}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "0px",
              paddingLeft: "40px",
              paddingRight: "40px",
              paddingTop: "0px",
              paddingBottom: "0px",
              width: "100vw",
              marginLeft: "calc(50% - 50vw)",
              "@media (max-width: 640px)": {
                paddingLeft: "20px",
                paddingRight: "20px",
              },
            })}
          >
            <div
              class={css({
                width: "100%",
                alignSelf: "stretch",
                flexGrow: "1",
                maxWidth: "1200px",
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
                marginRight: "auto",
              })}
            >
              <div
                class={css({
                  position: "relative",
                  marginTop: "0px",
                  width: "100%",
                  paddingTop: "30px",
                  paddingBottom: "30px",
                  maxWidth: "1400px",
                  alignSelf: "center",
                  display: "flex",
                  flexDirection: "column",
                  "@media (max-width: 991px)": {
                    marginTop: "30px",
                    paddingTop: "0px",
                    paddingBottom: "30px",
                    width: "100%",
                  },
                  "@media (max-width: 640px)": {
                    paddingBottom: "30px",
                    marginTop: "0px",
                    paddingTop: "30px",
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    "@media (max-width: 999px)": {
                      flexDirection: "column",
                      alignItems: "stretch",
                    },
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "0px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "20px",
                        height: "auto",
                        paddingBottom: "30px",
                        "@media (max-width: 991px)": {
                          marginTop: "0px",
                        },
                        "@media (max-width: 640px)": {
                          marginTop: "0px",
                          paddingBottom: "0px",
                        },
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          minHeight: "20px",
                          minWidth: "20px",
                          overflow: "hidden",
                          "@media (max-width: 991px)": {
                            height: "auto",
                            flexGrow: "0",
                          },
                        })}
                      >
                        <div
                          class={css({
                            position: "relative",
                          })}
                        >
                          <picture>
                            <source
                              srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?format=webp&width=690 690w"
                              type="image/webp"
                            />

                            <img
                              class={css({
                                objectFit: "contain",
                                objectPosition: "center",
                                position: "absolute",
                                height: "100%",
                                width: "100%",
                                top: "0",
                                left: "0",
                              })}
                              loading="lazy"
                              src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=918"
                              sizes="(max-width: 638px) 94vw, 50vw"
                              srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F28cf67e4fb5e4ada8391c5bb4d18694e?width=690 690w"
                            />
                          </picture>

                          <div
                            class={css({
                              width: "100%",
                              paddingTop: "80.16%",
                              pointerEvents: "none",
                              fontSize: "0",
                            })}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "20px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "auto",
                        height: "auto",
                        paddingBottom: "30px",
                        marginBottom: "auto",
                        width: "90%",
                        "@media (max-width: 991px)": {
                          marginTop: "0px",
                        },
                        "@media (max-width: 640px)": {
                          marginTop: "0px",
                          paddingBottom: "0px",
                        },
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "60px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "54px",
                          fontWeight: "400",
                          fontFamily: "Basic Sans, sans-serif",
                          letterSpacing: "-0.03em",
                          marginRight: "auto",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "0px",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "32px",
                            marginTop: "20px",
                            width: "100%",
                          },
                        })}
                      >
                        <p>Build for the entire customer journey</p>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "30px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "18px",
                          fontWeight: "400",
                          alignSelf: "center",
                          marginRight: "auto",
                          color: "rgba(14, 32, 26, 0.6)",
                          fontFamily: "Avenir, sans-serif",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "20px",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "16px",
                            width: "100%",
                          },
                        })}
                      >
                        <p>
                          Create the optimal end-to-end experience, from
                          high-impact pages (collections, product pages, cart)
                          to the essential touches (pop-ups, slide-ups,
                          announcement bars).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <a
            class={css({
              display: "flex",
              position: "relative",
              marginTop: "20px",
              height: "auto",
              paddingBottom: "0px",
              justifyContent: "center",
              marginLeft: "auto",
              marginRight: "auto",
              cursor: "pointer",
              pointerEvents: "auto",
            })}
            href="https://apps.shopify.com/builder-2"
            target="_blank"
          >
            <div
              class={css({
                display: "flex",
                flexDirection: "row",
                position: "relative",
                marginTop: "20px",
                paddingBottom: "0px",
                justifyContent: "center",
                alignItems: "center",
              })}
            ></div>
          </a>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "0px",
              paddingLeft: "40px",
              paddingRight: "40px",
              paddingTop: "0px",
              paddingBottom: "0px",
              width: "100vw",
              marginLeft: "calc(50% - 50vw)",
              "@media (max-width: 640px)": {
                paddingLeft: "20px",
                paddingRight: "20px",
              },
            })}
          >
            <div
              class={css({
                width: "100%",
                alignSelf: "stretch",
                flexGrow: "1",
                maxWidth: "1200px",
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
                marginRight: "auto",
              })}
            >
              <a
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  height: "auto",
                  borderRadius: "100px",
                  backgroundImage:
                    "linear-gradient(to right, #E07748 , #BD3827 , #45B7CF , #207593)",
                  width: "auto",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  marginRight: "20px",
                  flexGrow: "0",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  alignSelf: "center",
                  "@media (max-width: 640px)": {
                    marginLeft: "auto",
                    marginRight: "auto",
                    width: "auto",
                    flexGrow: "0",
                  },
                })}
                href="https://apps.shopify.com/builder-2"
              >
                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    appearance: "none",
                    paddingTop: "15px",
                    paddingBottom: "15px",
                    paddingLeft: "45px",
                    paddingRight: "45px",
                    color: "rgba(244, 243, 233, 1)",
                    borderRadius: "50px",
                    textAlign: "center",
                    cursor: "pointer",
                    height: "auto",
                    marginLeft: "auto",
                    marginRight: "auto",
                    backgroundImage:
                      "linear-gradient(to right , #1e231c , #364b34)",
                    fontSize: "24px",
                    lineHeight: "29px",
                    fontFamily: "Basic Sans, sans-serif",
                    flexGrow: "0",
                    "@media (max-width: 640px)": {
                      fontSize: "16px",
                      paddingTop: "10px",
                      paddingLeft: "15px",
                      paddingRight: "15px",
                      paddingBottom: "10px",
                    },
                  })}
                >
                  <a href="" target="_self">
                    Try for free
                  </a>
                </div>
              </a>

              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  width: "100%",
                  flexGrow: "0",
                  paddingBottom: "30px",
                  backgroundColor: "rgba(244, 243, 233, 1)",
                  height: "auto",
                  maxWidth: "1400px",
                  alignSelf: "center",
                  marginTop: "0px",
                  paddingTop: "30px",
                  "@media (max-width: 991px)": {
                    height: "auto",
                    flexGrow: "0",
                    paddingBottom: "30px",
                    marginTop: "20px",
                    width: "100%",
                  },
                  "@media (max-width: 640px)": {
                    marginTop: "0px",
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    "@media (max-width: 999px)": {
                      flexDirection: "column",
                      alignItems: "stretch",
                    },
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "0px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        height: "auto",
                        paddingBottom: "30px",
                        backgroundColor: "rgba(244, 243, 233, 1)",
                        marginTop: "auto",
                        marginBottom: "auto",
                        "@media (max-width: 991px)": {
                          marginLeft: "0px",
                          paddingLeft: "0px",
                          paddingBottom: "0px",
                        },
                        "@media (max-width: 640px)": {
                          paddingLeft: "0px",
                          marginTop: "20px",
                        },
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "20px",
                          height: "auto",
                          width: "auto",
                          borderRadius: "30px",
                          background:
                            "linear-gradient(269.81deg, #45B7CF 0.17%, #207593 99.84%)",
                          alignSelf: "center",
                          flexGrow: "0",
                          paddingTop: "5px",
                          paddingBottom: "5px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          marginRight: "auto",
                          "@media (max-width: 991px)": {
                            paddingTop: "px",
                          },
                          "@media (max-width: 640px)": {
                            width: "auto",
                            height: "auto",
                            marginTop: "0px",
                            paddingLeft: "20px",
                            alignSelf: "center",
                            flexGrow: "0",
                          },
                        })}
                      >
                        <div
                          class={css({
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            marginTop: "auto",
                            lineHeight: "normal",
                            height: "auto",
                            textAlign: "left",
                            color: "rgba(244, 243, 233, 1)",
                            fontSize: "14px",
                            marginLeft: "auto",
                            marginRight: "auto",
                            marginBottom: "auto",
                            letterSpacing: ".18em",
                            fontFamily: "Basic Sans, sans-serif",
                            "@media (max-width: 991px)": {
                              textAlign: "center",
                            },
                            "@media (max-width: 640px)": {
                              fontSize: "12px",
                              textAlign: "left",
                            },
                          })}
                        >
                          <p>OPTIMIZE</p>
                        </div>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "20px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "54px",
                          fontWeight: "400",
                          fontFamily: "Basic Sans, sans-serif",
                          letterSpacing: "-0.03em",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "20px",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "32px",
                          },
                        })}
                      >
                        <p>Make sure your content converts</p>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "30px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "18px",
                          fontWeight: "400",
                          alignSelf: "center",
                          marginRight: "auto",
                          color: "rgba(14, 32, 26, 0.6)",
                          fontFamily: "Avenir, sans-serif",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "20px",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "16px",
                            width: "100%",
                          },
                        })}
                      >
                        <p>
                          With Theme Studio, you can personalize your storefront
                          by creating targeted page-level or content-specific
                          experiences for different customer segments. Perform
                          unlimited A/B tests to understand how and if changes
                          impact funnel performance. Plus, our dashboards tell
                          you just how much money each change made, and allows
                          you to revert any misstep instantly. It's like magic.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "20px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        height: "auto",
                        paddingBottom: "0px",
                        "@media (max-width: 991px)": {
                          paddingBottom: "0px",
                          height: "auto",
                          flexGrow: "0",
                        },
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "0px",
                          minHeight: "20px",
                          minWidth: "20px",
                          overflow: "hidden",
                        })}
                      >
                        <div
                          class={css({
                            position: "relative",
                          })}
                        >
                          <picture>
                            <source
                              srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?format=webp&width=792 792w"
                              type="image/webp"
                            />

                            <img
                              class={css({
                                objectFit: "contain",
                                objectPosition: "center",
                                position: "absolute",
                                height: "100%",
                                width: "100%",
                                top: "0",
                                left: "0",
                              })}
                              loading="lazy"
                              src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=918"
                              sizes="(max-width: 638px) 94vw, 57vw"
                              srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feb326c42e0df4b1ba4479905005f7fde?width=792 792w"
                            />
                          </picture>

                          <div
                            class={css({
                              width: "100%",
                              paddingTop: "80.16%",
                              pointerEvents: "none",
                              fontSize: "0",
                            })}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "0px",
              paddingLeft: "0px",
              paddingRight: "0px",
              paddingTop: "0px",
              paddingBottom: "0px",
              width: "100%",
              backgroundColor:
                "linear-gradient(45deg, #F4F3E9 0%, #FFFFFF 100%);",
              height: "auto",
              flexGrow: "0",
              maxWidth: "1400px",
              marginLeft: "auto",
              marginRight: "auto",
              "@media (max-width: 991px)": {
                height: "auto",
                flexGrow: "0",
                paddingBottom: "0px",
                marginTop: "0px",
              },
              "@media (max-width: 640px)": {
                paddingTop: "0px",
              },
            })}
          >
            <div
              class={css({
                width: "100%",
                alignSelf: "stretch",
                flexGrow: "1",
                maxWidth: "1200px",
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
                marginRight: "auto",
              })}
            ></div>
          </div>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "0px",
              paddingLeft: "40px",
              paddingRight: "40px",
              paddingTop: "0px",
              paddingBottom: "0px",
              width: "100vw",
              marginLeft: "calc(50% - 50vw)",
              backgroundColor: "rgba(244, 243, 233, 1)",
              height: "auto",
              flexGrow: "0",
              "@media (max-width: 991px)": {
                height: "auto",
                flexGrow: "0",
                paddingBottom: "30px",
                paddingTop: "30px",
                marginTop: "0px",
              },
              "@media (max-width: 640px)": {
                paddingBottom: "30px",
                marginTop: "0px",
                paddingLeft: "20px",
                paddingRight: "20px",
              },
            })}
          >
            <div
              class={css({
                width: "100%",
                alignSelf: "stretch",
                flexGrow: "1",
                maxWidth: "1200px",
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
                marginRight: "auto",
              })}
            >
              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  width: "100%",
                  flexGrow: "1",
                  backgroundColor: "rgba(244, 243, 233, 1)",
                  paddingBottom: "30px",
                  maxWidth: "1400px",
                  alignSelf: "center",
                  paddingTop: "30px",
                  "@media (max-width: 991px)": {
                    height: "auto",
                    flexGrow: "0",
                    paddingBottom: "0px",
                    marginTop: "20px",
                    width: "100%",
                  },
                  "@media (max-width: 640px)": {
                    marginTop: "0px",
                  },
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    "@media (max-width: 999px)": {
                      flexDirection: "column",
                      alignItems: "stretch",
                    },
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "0px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        height: "auto",
                        paddingBottom: "30px",
                        backgroundColor: "rgba(244, 243, 233, 1)",
                        "@media (max-width: 991px)": {
                          marginLeft: "0px",
                          paddingLeft: "30px",
                          paddingBottom: "55px",
                        },
                        "@media (max-width: 640px)": {
                          paddingBottom: "0px",
                          paddingLeft: "0px",
                        },
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          textAlign: "center",
                          lineHeight: "normal",
                          height: "auto",
                          minHeight: "20px",
                          minWidth: "20px",
                          overflow: "hidden",
                          flexGrow: "1",
                          marginTop: "55px",
                          "@media (max-width: 991px)": {
                            height: "auto",
                            flexGrow: "0",
                            marginTop: "0px",
                          },
                          "@media (max-width: 640px)": {
                            paddingBottom: "px",
                            marginBottom: "30px",
                            marginTop: "0px",
                          },
                        })}
                      >
                        <div
                          class={css({
                            position: "relative",
                          })}
                        >
                          <picture>
                            <source
                              srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?format=webp&width=559 559w"
                              type="image/webp"
                            />

                            <img
                              class={css({
                                objectFit: "contain",
                                objectPosition: "center",
                                position: "absolute",
                                height: "100%",
                                width: "100%",
                                top: "0",
                                left: "0",
                              })}
                              loading="lazy"
                              src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=918"
                              sizes="(max-width: 638px) 94vw, 40vw"
                              srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F69ac0d8eacdc4e699227588000a4b5f4?width=559 559w"
                            />
                          </picture>

                          <div
                            class={css({
                              width: "100%",
                              paddingTop: "80.16%",
                              pointerEvents: "none",
                              fontSize: "0",
                            })}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "normal",
                      width: "calc(50% - 10px)",
                      marginLeft: "20px",
                      "@media (max-width: 999px)": {
                        width: "100%",
                        marginLeft: 0,
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        marginTop: "auto",
                        height: "auto",
                        paddingBottom: "30px",
                        marginBottom: "auto",
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "20px",
                          height: "auto",
                          width: "auto",
                          borderRadius: "30px",
                          background:
                            "linear-gradient(270deg, #E07748 0%, #BD3827 100%)",
                          alignSelf: "center",
                          flexGrow: "0",
                          paddingTop: "5px",
                          paddingBottom: "5px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          marginRight: "auto",
                          marginLeft: "20px",
                          "@media (max-width: 991px)": {
                            paddingTop: "px",
                            marginLeft: "0px",
                          },
                          "@media (max-width: 640px)": {
                            width: "auto",
                            height: "auto",
                            marginTop: "0px",
                            alignSelf: "center",
                            flexGrow: "0",
                          },
                        })}
                      >
                        <div
                          class={css({
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            marginTop: "auto",
                            lineHeight: "normal",
                            height: "auto",
                            textAlign: "left",
                            color: "rgba(244, 243, 233, 1)",
                            fontSize: "14px",
                            marginLeft: "auto",
                            marginRight: "auto",
                            marginBottom: "auto",
                            letterSpacing: ".18em",
                            fontFamily: "Basic Sans, sans-serif",
                            "@media (max-width: 991px)": {
                              textAlign: "center",
                            },
                            "@media (max-width: 640px)": {
                              fontSize: "12px",
                              textAlign: "left",
                            },
                          })}
                        >
                          <p>ANALYZE</p>
                        </div>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "20px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "54px",
                          fontWeight: "400",
                          fontFamily: "Basic Sans, sans-serif",
                          letterSpacing: "-0.03em",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "20px",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "32px",
                          },
                        })}
                      >
                        <p>Know what is, and isn’t working</p>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          marginTop: "30px",
                          textAlign: "left",
                          lineHeight: "normal",
                          height: "auto",
                          fontSize: "18px",
                          fontWeight: "400",
                          alignSelf: "center",
                          marginRight: "auto",
                          color: "rgba(14, 32, 26, 0.6)",
                          fontFamily: "Avenir, sans-serif",
                          "@media (max-width: 991px)": {
                            marginRight: "auto",
                            marginTop: "20px",
                          },
                          "@media (max-width: 640px)": {
                            fontSize: "16px",
                            width: "100%",
                          },
                        })}
                      >
                        <p>
                          The best merchants find ways to test, iterate,
                          measure, and then do it better the next time. Theme
                          Studio's analytics suite comes with site, page, and
                          content-level insights, as well as heat maps that show
                          both engagement (nice) and impact on conversation
                          (very nice).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  marginTop: "0px",
                  paddingLeft: "40px",
                  paddingRight: "40px",
                  paddingTop: "0px",
                  paddingBottom: "0px",
                  width: "100vw",
                  marginLeft: "calc(50% - 50vw)",
                  "@media (max-width: 640px)": {
                    paddingLeft: "20px",
                    paddingRight: "20px",
                  },
                })}
              >
                <div
                  class={css({
                    width: "100%",
                    alignSelf: "stretch",
                    flexGrow: "1",
                    maxWidth: "1200px",
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: "auto",
                    marginRight: "auto",
                  })}
                >
                  <div
                    class={css({
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      marginTop: "0px",
                      maxWidth: "1400px",
                      paddingTop: "30px",
                      paddingBottom: "30px",
                      width: "100%",
                      alignSelf: "center",
                      "@media (max-width: 991px)": {
                        width: "100%",
                      },
                    })}
                  >
                    <div
                      class={css({
                        display: "flex",
                        "@media (max-width: 999px)": {
                          flexDirection: "column",
                          alignItems: "stretch",
                        },
                      })}
                    >
                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          lineHeight: "normal",
                          width: "calc(50% - 10px)",
                          marginLeft: "0px",
                          "@media (max-width: 999px)": {
                            width: "100%",
                            marginLeft: 0,
                          },
                        })}
                      >
                        <div
                          class={css({
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            marginTop: "auto",
                            height: "auto",
                            paddingBottom: "30px",
                            marginBottom: "auto",
                            "@media (max-width: 640px)": {
                              marginTop: "20px",
                            },
                          })}
                        >
                          <div
                            class={css({
                              display: "flex",
                              flexDirection: "column",
                              position: "relative",
                              marginTop: "20px",
                              height: "auto",
                              width: "auto",
                              borderRadius: "30px",
                              background:
                                "linear-gradient(270deg, #365C42 0%, #0E201A 100%)",
                              alignSelf: "center",
                              flexGrow: "0",
                              paddingTop: "5px",
                              paddingBottom: "5px",
                              paddingLeft: "20px",
                              paddingRight: "20px",
                              marginRight: "auto",
                              "@media (max-width: 991px)": {
                                paddingTop: "px",
                              },
                              "@media (max-width: 640px)": {
                                width: "auto",
                                height: "auto",
                                marginTop: "0px",
                                alignSelf: "center",
                                flexGrow: "0",
                              },
                            })}
                          >
                            <div
                              class={css({
                                display: "flex",
                                flexDirection: "column",
                                position: "relative",
                                marginTop: "auto",
                                lineHeight: "normal",
                                height: "auto",
                                textAlign: "left",
                                color: "rgba(244, 243, 233, 1)",
                                fontSize: "14px",
                                marginLeft: "auto",
                                marginRight: "auto",
                                marginBottom: "auto",
                                letterSpacing: ".18em",
                                fontFamily: "Basic Sans, sans-serif",
                                "@media (max-width: 991px)": {
                                  textAlign: "center",
                                },
                                "@media (max-width: 640px)": {
                                  fontSize: "12px",
                                  textAlign: "left",
                                },
                              })}
                            >
                              <p>CUSTOMIZE</p>
                            </div>
                          </div>

                          <div
                            class={css({
                              display: "flex",
                              flexDirection: "column",
                              position: "relative",
                              marginTop: "20px",
                              textAlign: "left",
                              lineHeight: "normal",
                              height: "auto",
                              fontSize: "54px",
                              fontWeight: "400",
                              fontFamily: "Basic Sans, sans-serif",
                              letterSpacing: "-0.03em",
                              "@media (max-width: 991px)": {
                                marginRight: "auto",
                                marginTop: "20px",
                              },
                              "@media (max-width: 640px)": {
                                fontSize: "32px",
                              },
                            })}
                          >
                            <p>Tons of apps, all out-of-the-box</p>
                          </div>

                          <div
                            class={css({
                              display: "flex",
                              flexDirection: "column",
                              position: "relative",
                              marginTop: "30px",
                              textAlign: "left",
                              lineHeight: "normal",
                              height: "auto",
                              fontSize: "18px",
                              fontWeight: "400",
                              alignSelf: "center",
                              marginRight: "auto",
                              color: "rgba(14, 32, 26, 0.6)",
                              fontFamily: "Avenir, sans-serif",
                              "@media (max-width: 991px)": {
                                marginRight: "auto",
                                marginTop: "20px",
                              },
                              "@media (max-width: 640px)": {
                                fontSize: "16px",
                                width: "100%",
                              },
                            })}
                          >
                            <p>
                              Stop installing an endless number of apps. Theme
                              Studio comes with so much power and so many
                              capabilities, you'll be able to uninstall apps
                              that needlessly slow down your storefront and only
                              keep the ones providing real value.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        class={css({
                          display: "flex",
                          flexDirection: "column",
                          lineHeight: "normal",
                          width: "calc(50% - 10px)",
                          marginLeft: "20px",
                          "@media (max-width: 999px)": {
                            width: "100%",
                            marginLeft: 0,
                          },
                        })}
                      >
                        <div
                          class={css({
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            textAlign: "center",
                            lineHeight: "normal",
                            height: "auto",
                            minHeight: "20px",
                            minWidth: "20px",
                            overflow: "hidden",
                          })}
                        >
                          <div
                            class={css({
                              position: "relative",
                            })}
                          >
                            <picture>
                              <source
                                srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?format=webp&width=807 807w"
                                type="image/webp"
                              />

                              <img
                                class={css({
                                  objectFit: "contain",
                                  objectPosition: "center",
                                  position: "absolute",
                                  height: "100%",
                                  width: "100%",
                                  top: "0",
                                  left: "0",
                                })}
                                loading="lazy"
                                src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=918"
                                sizes="(max-width: 638px) 94vw, 58vw"
                                srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=918 918w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=598 598w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0d443f6c91734e7ea557debe74bdd63b?width=807 807w"
                              />
                            </picture>

                            <div
                              class={css({
                                width: "100%",
                                paddingTop: "70.04048582995948%",
                                pointerEvents: "none",
                                fontSize: "0",
                              })}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              paddingTop: "0px",
              paddingBottom: "0px",
              width: "100%",
              backgroundColor: "rgba(244, 243, 233, 1)",
              height: "auto",
              flexGrow: "0",
              maxWidth: "1400px",
              marginLeft: "auto",
              marginRight: "auto",
              "@media (max-width: 991px)": {
                height: "auto",
                flexGrow: "0",
                marginTop: "0px",
              },
              "@media (max-width: 640px)": {
                marginTop: "0px",
                height: "auto",
                flexGrow: "0",
              },
            })}
          >
            <div
              class={css({
                width: "100%",
                alignSelf: "stretch",
                flexGrow: "1",
                maxWidth: "1200px",
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
                marginRight: "auto",
              })}
            ></div>
          </div>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "0px",
              minHeight: "20px",
              minWidth: "20px",
              overflow: "hidden",
              width: "100vw",
              marginLeft: "calc(50% - 50vw)",
              "@media (max-width: 640px)": {
                marginTop: "0px",
              },
            })}
          >
            <div
              class={css({
                position: "relative",
              })}
            >
              <picture>
                <source
                  srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?format=webp&width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?format=webp&width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?format=webp&width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?format=webp&width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?format=webp&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?format=webp&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?format=webp&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?format=webp&width=638 638w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?format=webp&width=998 998w"
                  type="image/webp"
                />

                <img
                  class={css({
                    objectFit: "cover",
                    objectPosition: "center",
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    top: "0",
                    left: "0",
                  })}
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=2000"
                  sizes="(max-width: 638px) 100vw, 100vw"
                  srcSet="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=638 638w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Faa89047b9471479a960a994234fd77c8?width=998 998w"
                />
              </picture>

              <div
                class={css({
                  width: "100%",
                  paddingTop: "70.6%",
                  pointerEvents: "none",
                  fontSize: "0",
                })}
              ></div>
            </div>
          </div>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "94px",
              lineHeight: "normal",
              height: "auto",
              textAlign: "left",
              fontSize: "72px",
              fontWeight: "400",
              fontFamily: "Basic Sans, sans-serif",
              "@media (max-width: 991px)": {
                fontSize: "35px",
                marginTop: "20px",
              },
              "@media (max-width: 640px)": {
                fontSize: "32px",
                marginTop: "20px",
              },
            })}
          >
            <p>
              <span>Frequently</span>
              Asked Questions
            </p>
          </div>

          <div
            class={css({
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginTop: "20px",
              lineHeight: "normal",
              height: "auto",
              textAlign: "left",
              fontSize: "24px",
              fontWeight: "600",
              width: "74%",
              marginBottom: "30px",
              fontFamily: "Basic Sans, sans-serif",
              "@media (max-width: 991px)": {
                fontSize: "20px",
                width: "90%",
              },
              "@media (max-width: 640px)": {
                width: "100%",
                fontSize: "16px",
              },
            })}
          >
            <p>
              Have a different question about how Builder.io works or the
              pricing plans available? Try getting in touch with one of our
              specialists via live chat.
            </p>
          </div>

          <div
            class={css({
              display: "flex",
              position: "relative",
              marginTop: "20px",
              height: "auto",
              width: "100%",
              backgroundColor: "rgba(244, 243, 233, 1)",
              paddingBottom: "60px",
              paddingTop: "60px",
              "@media (max-width: 991px)": {
                paddingTop: "0px",
              },
              "@media (max-width: 640px)": {
                paddingTop: "0px",
              },
            })}
          ></div>
        </div>
      </div>
    </Fragment>
  );
}
