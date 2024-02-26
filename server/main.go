// todo: major refactorings and improvements
package main

import (
	"bufio"
	"log"
	"os"
	"os/exec"

	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
)

type socketServer struct {
	Server *socketio.Server
}

func NewSocketServer() *socketServer {
	server := socketio.NewServer(nil)
	return &socketServer{server}
}

func (ss *socketServer) RunModel() {
	go func() {
		dirPath := os.ExpandEnv("$HOME/www/github.com/ojpbarbosa/pandemica/model")

		cmd := exec.Command("bun", "start")
		cmd.Dir = dirPath
		stdout, _ := cmd.StdoutPipe()
		err := cmd.Start()
		if err != nil {
			log.Fatal(err)
		}

		reader := bufio.NewReader(stdout)
		for {
			output, _, err := reader.ReadLine()
			if err != nil {
				log.Fatal(err)
			}
			ss.Server.BroadcastToNamespace("/", "model-output", string(output))
		}
	}()
}

func (ss *socketServer) RegisterEvents() {
	ss.Server.OnConnect("/", func(s socketio.Conn) error {
		log.Println("Connected:", s.ID())
		return nil
	})
}

func main() {
	router := gin.Default()

	socketServer := NewSocketServer()

	socketServer.RegisterEvents()

	router.GET("/socket.io/*any", gin.WrapH(socketServer.Server))
	router.POST("/socket.io/*any", gin.WrapH(socketServer.Server))

	log.Println("Serving at localhost:8080...")
	router.Run(":8080")
}
