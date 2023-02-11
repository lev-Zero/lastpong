rm -rf $HOME/.brew && git clone --depth=1 https://github.com/Homebrew/brew $HOME/.brew && echo 'export PATH=$HOME/.brew/bin:$PATH' >> $HOME/.zshrc && source $HOME/.zshrc && brew update

cd $HOME/goinfre
brew install nodejs

npm i -g @nestjs/cli

# 아래 세줄 : goinfre에 docker 까는 법
# 이후 켜진 docker에 설정 아이콘 -> Resources 탭 -> Disk image location을 /goinfre/$USERNAME으로 변경
# 재부팅 이후 goinfre 안에서 lastpong make
git clone https://github.com/alexandregv/42toolbox.git $HOME/goinfre/toolbox
cd $HOME/goinfre/toolbox
sh ./init_docker.sh
